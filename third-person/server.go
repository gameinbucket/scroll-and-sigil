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

	"github.com/gorilla/websocket"
)

const (
	contentType = "Content-type"
	textPlain   = "text/plain"
	dir         = "./public"
	home        = dir + "/app.html"
	api         = "/api"
	caching     = false
	sessionTime = 60 * 30
)

var extensions = map[string]string{
	".html": "text/html",
	".js":   "text/javascript",
	".css":  "text/css",
	".png":  "image/png",
	".jpg":  "image/jpeg",
	".svg":  "image/svg+xml",
	".ico":  "image/x-icon",
	".wav":  "audio/wav",
	".mp3":  "audio/mpeg",
	".json": "application/json",
	".ttf":  "application/font-ttf",
}

var (
	server *http.Server
	files  []byte
)

func main() {
	stop := make(chan os.Signal)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	const port = "3000"
	server = &http.Server{Addr: ":" + port, Handler: http.HandlerFunc(serve)}

	fmt.Println("listening on port " + port)
	go func() {
		err := server.ListenAndServe()
		if err != nil {
			fmt.Println(err)
		}
	}()

	<-stop
	fmt.Println("signal interrupt")
	server.Shutdown(context.Background())
	fmt.Println()
}

func serve(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.RemoteAddr, r.Method, r.URL.Path)

	if strings.HasPrefix(r.URL.Path, api) {
		if r.Method == "POST" {
			w.Header().Set(contentType, textPlain)
			_, err := ioutil.ReadAll(r.Body)
			if err != nil {
				panic(err)
			}
		} else {
			w.Header().Set(contentType, textPlain)
			w.Write([]byte("GET " + r.URL.Path))
		}
		return
	}

	var path string
	if r.URL.Path == "/" {
		path = home
	} else if r.URL.Path == "/websocket" {
		connectSocket(w, r)
		return
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

func connectSocket(writer http.ResponseWriter, request *http.Request) {
	if request.Header.Get("Origin") != "http://"+request.Host {
		http.Error(writer, "origin not allowed", 403)
		return
	}
	upgrader := websocket.Upgrader{}
	connection, err := upgrader.Upgrade(writer, request, nil)
	if err != nil {
		http.Error(writer, "could not open websocket", 400)
		return
	}
	go socketRead(connection)
}

func socketRead(connection *websocket.Conn) {
	for {
		_, data, err := connection.ReadMessage()
		if err != nil {
			fmt.Println(err)
			connection.Close()
			break
		}
		content := string(data)
		fmt.Println("got>", content)

		message := fmt.Sprintf("hi")
		go socketWrite(connection, message)
	}
}

func socketWrite(connection *websocket.Conn, message string) {
	err := connection.WriteMessage(websocket.TextMessage, []byte(message))
	fmt.Println("sent>", message)
	if err != nil {
		fmt.Println("write error>", err)
	}
}
