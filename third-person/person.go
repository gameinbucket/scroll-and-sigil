package main

import (
	"fmt"
	"strings"

	"github.com/gorilla/websocket"
)

// Person struct
type Person struct {
	Connection *websocket.Conn
	Character  *Thing
	Think      func(me *Person, world *World)
	InputQueue []string
	InputCount int
}

// NewPerson func
func NewPerson(connection *websocket.Conn, world *World) *Person {
	p := &Person{Connection: connection}
	p.InputQueue = make([]string, 3)
	p.Character = world.You
	p.Think = ThinkYou
	world.People = append(world.People, p)
	return p
}

// Input func
func (me *Person) Input(in string) {
	if me.InputCount == len(me.InputQueue) {
		array := make([]string, me.InputCount+2)
		copy(array, me.InputQueue)
		me.InputQueue = array
	}
	me.InputQueue[me.InputCount] = in
	me.InputCount++
}

// ConnectionLoop func
func (me *Person) ConnectionLoop(server *Server) {
	for {
		_, data, err := me.Connection.ReadMessage()
		if err != nil {
			fmt.Println(err)
			me.Connection.Close()
			break
		}
		in := string(data)
		if in == "exit" {
			break
		}
		words := strings.Fields(in)
		server.mux.Lock()
		for _, w := range words {
			me.Input(w)
		}
		server.mux.Unlock()
	}
	server.RemovePerson(me)
}

// WriteToClient func
func (me *Person) WriteToClient(message string) {
	err := me.Connection.WriteMessage(websocket.TextMessage, []byte(message))
	if err != nil {
		fmt.Println("write error>", err)
	}
}
