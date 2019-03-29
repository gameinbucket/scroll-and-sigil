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
	"sync"
	"syscall"
	"time"

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
	if len(os.Args) != 2 {
		fmt.Println("port?")
		return
	}
	port := os.Args[1]

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

	server.people = make([]*Person, 0)
	server.mux = &sync.Mutex{}
	ticker := time.NewTicker(WorldTickRate * time.Millisecond)
	go func() {
		for range ticker.C {
			server.mux.Lock()
			num := len(server.people)
			if num > 0 {
				server.world.Update()
				server.world.BuildSnapshots(server.people)
				for i := 0; i < num; i++ {
					person := server.people[i]
					snap := person.snap.String()
					go person.WriteToClient(snap)
				}
			}
			server.mux.Unlock()
		}
	}()

	httpserver := &http.Server{Addr: ":" + port, Handler: http.HandlerFunc(serve)}
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
		server.connectSocket(w, r)
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

func (me *Server) connectSocket(writer http.ResponseWriter, request *http.Request) {
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

	me.mux.Lock()
	person := NewPerson(connection, server.world)
	me.people = append(me.people, person)
	data := me.world.Save("map", person)
	me.mux.Unlock()
	person.WriteToClient(data)
	go person.ConnectionLoop(me)
}

// RemovePerson func
func (me *Server) RemovePerson(person *Person) {
	me.mux.Lock()
	defer me.mux.Unlock()
	fmt.Println("removing person...")
	me.world.broadcast.WriteString("{del:")
	me.world.broadcast.WriteString(person.Character.NID)
	me.world.broadcast.WriteString("},")
	num := len(me.people)
	for i := 0; i < num; i++ {
		if me.people[i] == person {
			me.people[i] = me.people[num-1]
			me.people[num-1] = nil
			me.people = me.people[:num-1]
			return
		}
	}
}
