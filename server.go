package main

import (
	"fmt"
	"os"
	"sync"
)

const (
	contentType = "Content-type"
	textPlain   = "text/plain"
	dir         = "./public"
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

// Server struct
type Server struct {
	world  *World
	people []*Person
	mux    *sync.Mutex
}

var (
	server *Server
	files  []byte
)

func main() {
	num := len(os.Args)
	if num < 2 {
		fmt.Println("port [-editor]")
		return
	}
	port := os.Args[1]
	if num == 3 {
		editor(port)
	} else {
		game(port)
	}
}
