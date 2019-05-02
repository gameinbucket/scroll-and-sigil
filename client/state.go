package main

import (
	"bytes"
	"encoding/binary"
	"strings"
	"time"

	"./graphics"
)

type worldState struct {
	app            *app
	snapshotTime   int64
	previousUpdate int64
	chatbox        []string
}

func worldStateInit(a *app) *worldState {
	s := &worldState{}
	s.app = a
	return s
}

func (me *worldState) serverUpdates() {
	world := me.app.world
	socketQueue := me.app.socketQueue

	for i := 0; i < len(socketQueue); i++ {

		dat := bytes.NewReader(socketQueue[i])

		var uint32ref uint32
		binary.Read(dat, binary.LittleEndian, &uint32ref)
		me.snapshotTime = int64(uint32ref) + 1552330000000
		me.previousUpdate = time.Now().UnixNano()

		var broadcastCount uint8
		binary.Read(dat, binary.LittleEndian, &broadcastCount)

		for b := uint8(0); b < broadcastCount; b++ {
			var broadcastType uint8
			binary.Read(dat, binary.LittleEndian, &broadcastType)
			switch broadcastType {
			case BroadcastNew:
				var uid uint16
				var nid uint16
				binary.Read(dat, binary.LittleEndian, &uid)
				binary.Read(dat, binary.LittleEndian, &nid)
				if _, ok := world.netLookup[nid]; ok {
					break
				}
				var x float32
				var y float32
				var z float32
				binary.Read(dat, binary.LittleEndian, &x)
				binary.Read(dat, binary.LittleEndian, &y)
				binary.Read(dat, binary.LittleEndian, &z)
				switch uid {
				case PlasmaUID:
					var dx float32
					var dy float32
					var dz float32
					var damage uint16
					binary.Read(dat, binary.LittleEndian, &dx)
					binary.Read(dat, binary.LittleEndian, &dy)
					binary.Read(dat, binary.LittleEndian, &dz)
					binary.Read(dat, binary.LittleEndian, &damage)
					plasmaInit(world, nid, damage, x, y, z, dx, dy, dz)
				case HumanUID:
					var angle float32
					var health uint16
					var status uint8
					binary.Read(dat, binary.LittleEndian, &angle)
					binary.Read(dat, binary.LittleEndian, &health)
					binary.Read(dat, binary.LittleEndian, &status)
					humanInit(world, nid, x, y, z, angle, health, status)
				}
			case BroadcastDelete:
				var nid uint16
				binary.Read(dat, binary.LittleEndian, &nid)
				if thing, ok := world.netLookup[nid]; ok {
					switch typed := thing.(type) {
					case you:
					case human:
						typed.cleanup()
					}
				}
			case BroadcastChat:
				var size uint8
				binary.Read(dat, binary.LittleEndian, &size)
				chat := &strings.Builder{}
				for ch := uint8(0); ch < size; ch++ {
					var char uint8
					binary.Read(dat, binary.LittleEndian, &char)
					chat.WriteByte(char)
				}
				me.chatbox = append(me.chatbox, chat.String())
			}
		}

		var thingCount uint16
		binary.Read(dat, binary.LittleEndian, &thingCount)
		for t := uint16(0); t < thingCount; t++ {
			var nid uint16
			binary.Read(dat, binary.LittleEndian, &nid)
			thing, ok := world.netLookup[nid]
			if !ok {
				panic("missing thing nid")
			}
			var delta uint8
			binary.Read(dat, binary.LittleEndian, &delta)
			if delta&0x1 == 1 {
				var x float32
				var z float32
				binary.Read(dat, binary.LittleEndian, &x)
				binary.Read(dat, binary.LittleEndian, &z)
			}
			if delta&0x2 == 1 {
				var y float32
				binary.Read(dat, binary.LittleEndian, &y)
			}
			if delta&0x4 == 1 {
				var health uint16
				binary.Read(dat, binary.LittleEndian, &health)
			}
			if delta&0x8 == 1 {
				var status uint8
				binary.Read(dat, binary.LittleEndian, &status)
			}
			switch typed := thing.(type) {
			case you:
			case human:
				if delta&0x10 == 1 {
					var angle float32
					binary.Read(dat, binary.LittleEndian, &angle)
					typed.angle = angle
				}
			case baron:
				if delta&0x10 == 1 {
					var direction uint8
					binary.Read(dat, binary.LittleEndian, &direction)
					if direction != DirectionNone {
						typed.angle = DirectionToAngle[direction]
					}
				}
			}
		}
	}

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
