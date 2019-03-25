package main

import (
	"fmt"
	"strings"

	"github.com/gorilla/websocket"
)

// Person struct
type Person struct {
	Connection *websocket.Conn
	UUID       string
	InputQueue []string
	InputCount int
	Character  *You
}

// NewPerson func
func NewPerson(connection *websocket.Conn, world *World) *Person {
	person := &Person{Connection: connection}
	person.UUID = UUID()
	person.InputQueue = make([]string, 3)
	person.Character = world.NewPlayer(person)
	return person
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
	// me.Character.RemoveFromBlocks()
	server.RemovePerson(me)
}

// WriteToClient func
func (me *Person) WriteToClient(message string) {
	err := me.Connection.WriteMessage(websocket.TextMessage, []byte(message))
	if err != nil {
		fmt.Println("write error>", err)
	}
}
