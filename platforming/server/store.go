package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

const contentType = "Content-type"
const textPlain = "text/plain"

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

func serve(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.RemoteAddr, r.Method, r.URL.Path)

	w.Header().Set(contentType, textPlain)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(body))

	w.Header().Set(contentType, textPlain)
	w.Write([]byte("GET " + r.URL.Path))
}

func main() {
	stop := make(chan os.Signal)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	const port = "3000"
	server := &http.Server{Addr: ":" + port, Handler: http.HandlerFunc(serve)}

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
