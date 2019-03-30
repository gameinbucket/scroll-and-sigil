package main

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/gorilla/websocket"
)

// Person struct
type Person struct {
	Connection *websocket.Conn
	UUID       string
	InputQueue [][]byte
	InputCount int
	Character  *You
	snap       *strings.Builder
	binarySnap *bytes.Buffer
}

// NewPerson func
func NewPerson(connection *websocket.Conn, world *World) *Person {
	person := &Person{Connection: connection}
	person.UUID = UUID()
	person.InputQueue = make([][]byte, 3)
	person.Character = world.NewPlayer(person)
	person.snap = &strings.Builder{}
	person.binarySnap = new(bytes.Buffer)
	return person
}

// Input func
func (me *Person) Input(in []byte) {
	if me.InputCount == len(me.InputQueue) {
		array := make([][]byte, me.InputCount+2)
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
		server.mux.Lock()
		me.Input(data)
		server.mux.Unlock()
	}

	char := me.Character
	char.Health = 0
	char.World.RemoveThing(char.Thing)
	char.RemoveFromBlocks()

	server.RemovePerson(me)
}

// WriteToClient func
func (me *Person) WriteToClient(message string) {
	err := me.Connection.WriteMessage(websocket.TextMessage, []byte(message))
	if err != nil {
		fmt.Println("write error:", err)
	}
}

// WriteBinaryToClient func
func (me *Person) WriteBinaryToClient(binary []byte) {
	err := me.Connection.WriteMessage(websocket.BinaryMessage, binary)
	if err != nil {
		fmt.Println("write error:", err)
	}
}
