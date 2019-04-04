package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
)

func editor(port string) {
	stop := make(chan os.Signal)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	server = &Server{}

	server.world = NewWorld()
	file, err := os.Open("maps/test.map")
	if err != nil {
		panic(err)
	}
	contents, err := ioutil.ReadAll(file)
	if err != nil {
		panic(err)
	}
	server.world.Load(contents)

	httpserver := &http.Server{Addr: ":" + port, Handler: http.HandlerFunc(editorServe)}
	fmt.Println("listening on port " + port)

	go func() {
		err := httpserver.ListenAndServe()
		if err != nil {
			fmt.Println(err)
		}
	}()

	<-stop
	fmt.Println("signal interrupt")
	httpserver.Shutdown(context.Background())
	fmt.Println()
}

func editorServe(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.RemoteAddr, r.Method, r.URL.Path)

	const home = dir + "/editor.html"

	var path string
	if r.URL.Path == "/" {
		path = home
	} else if strings.HasSuffix(r.URL.Path, ".map") {
		path = "./maps" + r.URL.Path
	} else {
		path = dir + r.URL.Path
	}

	file, err := os.Open(path)
	if err != nil {
		path = home
		file, err = os.Open(path)
		if err != nil {
			return
		}
	}

	contents, err := ioutil.ReadAll(file)
	if err != nil {
		panic(err)
	}

	typ, ok := extensions[filepath.Ext(path)]
	if !ok {
		typ = textPlain
	}

	w.Header().Set(contentType, typ)
	w.Write(contents)
}
