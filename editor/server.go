package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

const (
	contentType = "Content-type"
	textPlain   = "text/plain"
	dir         = "./public"
	api         = "/api"
	home        = dir + "/editor.html"
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

func main() {
	num := len(os.Args)

	port := "3000"
	if num > 1 {
		port = os.Args[1]
	}

	level := "maps/test.map"
	if num > 2 {
		level = "maps/" + os.Args[2] + ".map"
	}

	stop := make(chan os.Signal)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	serveFunction := editor(level)

	httpserver := &http.Server{Addr: ":" + port, Handler: http.HandlerFunc(serveFunction)}
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
