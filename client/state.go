package main

import (
	"./graphics"
)

type worldState struct {
	app            *app
	snapTime       int
	previousUpdate int
	chatbox        []string
}

func worldStateInit(a *app) *worldState {
	s := &worldState{}
	s.app = a
	return s
}

func (me *worldState) serverUpdates() {
	// bytes := []byte{0}
	// socket.Call("send", js.TypedArrayOf(bytes))
}

func (me *worldState) update() {
}

func (me *worldState) render() {
	app := me.app
	gl := app.gl
	world := app.world
	cam := app.camera

	cam.update(world)

	gl.Call("clear", graphics.GLxColorBufferBit)
	gl.Call("clear", graphics.GLxDepthBufferBit)
}
