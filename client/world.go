package main

import (
	"bytes"
	"encoding/binary"
	"syscall/js"

	"./graphics"
)

// Constants
const (
	NetUpdateRate  = 50
	InverseNetRate = 16.67 / NetUpdateRate

	WorldPositiveX = 0
	WorldPositiveY = 1
	WorldPositiveZ = 2
	WorldNegativeX = 3
	WorldNegativeY = 4
	WorldNegativeZ = 5

	BroadcastNew    = 0
	BroadcastDelete = 1
	BroadcastChat   = 2
)

type world struct {
	g            *graphics.RenderSystem
	gl           js.Value
	width        int
	height       int
	length       int
	tileWidth    int
	tileHeight   int
	tileLength   int
	slice        int
	all          int
	blocks       []*block
	viewable     []*block
	spriteSet    map[*Thing]bool
	spriteBuffer map[string]*graphics.RenderBuffer
	spriteCount  int
	ThingCount   int
	ItemCount    int
	MissileCount int
	Things       []*Thing
	Items        []*Item
	Missiles     []*Missile
	netLookup    map[uint16]*Thing
	PID          uint16
}

func worldInit(g *graphics.RenderSystem, gl js.Value) *world {
	w := &world{}
	w.g = g
	w.gl = gl
	return w
}

func (me *world) reset() {
	me.blocks = make([]*block, me.all)
}

func (me *world) load(raw []byte) {
	dat := bytes.NewReader(raw)

	var uint8ref uint8
	var uint16ref uint16

	// TODO binary.Read sucks, implement custom solution for client and server
	// https://github.com/golang/go/blob/master/src/encoding/binary/binary.go

	binary.Read(dat, binary.LittleEndian, &me.PID)

	binary.Read(dat, binary.LittleEndian, &uint16ref)
	me.width = int(uint16ref)
	binary.Read(dat, binary.LittleEndian, &uint16ref)
	me.height = int(uint16ref)
	binary.Read(dat, binary.LittleEndian, &uint16ref)
	me.length = int(uint16ref)

	me.slice = me.width * me.height
	me.all = me.slice * me.length

	me.tileWidth = me.width * BlockSize
	me.tileHeight = me.height * BlockSize
	me.tileLength = me.length * BlockSize

	me.reset()

	bx := 0
	by := 0
	bz := 0
	for i := 0; i < me.all; i++ {
		me.blocks[i] = blockInit(bx, by, bz)
		bx++
		if bx == me.width {
			bx = 0
			by++
			if by == me.height {
				by = 0
				bz++
			}
		}
	}

	for i := 0; i < me.all; i++ {
		b := me.blocks[i]
		binary.Read(dat, binary.LittleEndian, &uint8ref)
		notEmpty := uint8ref != 0
		if notEmpty {
			for t := 0; t < BlockAll; t++ {
				binary.Read(dat, binary.LittleEndian, &uint8ref)
				tileType := int(uint8ref)
				b.tiles[t].typeOf = tileType
			}
		}

		var lightCount uint8
		binary.Read(dat, binary.LittleEndian, &lightCount)
		for t := uint8(0); t < lightCount; t++ {
			var x uint8
			var y uint8
			var z uint8
			var rgb int32
			binary.Read(dat, binary.LittleEndian, &x)
			binary.Read(dat, binary.LittleEndian, &y)
			binary.Read(dat, binary.LittleEndian, &z)
			binary.Read(dat, binary.LittleEndian, &rgb)
			b.addLight(lightInit(x, y, z, rgb))
		}
	}

	var thingCount uint16
	binary.Read(dat, binary.LittleEndian, &thingCount)
	for t := uint16(0); t < thingCount; t++ {
		var uid uint16
		var nid uint16
		var x float32
		var y float32
		var z float32
		binary.Read(dat, binary.LittleEndian, &uid)
		binary.Read(dat, binary.LittleEndian, &nid)
		binary.Read(dat, binary.LittleEndian, &x)
		binary.Read(dat, binary.LittleEndian, &y)
		binary.Read(dat, binary.LittleEndian, &z)
		switch uid {
		case HumanUID:
			var angle float32
			var health uint16
			var status uint8
			binary.Read(dat, binary.LittleEndian, &angle)
			binary.Read(dat, binary.LittleEndian, &health)
			binary.Read(dat, binary.LittleEndian, &status)
			if nid == me.PID {
				youInit(me, nid, x, y, z, angle, health, status)
			} else {
				humanInit(me, nid, x, y, z, angle, health, status)
			}
		case BaronUID:
			var direction uint8
			var health uint16
			var status uint8
			binary.Read(dat, binary.LittleEndian, &direction)
			binary.Read(dat, binary.LittleEndian, &health)
			binary.Read(dat, binary.LittleEndian, &status)
			baronInit(me, nid, x, y, z, direction, health, status)
		case TreeUID:
			treeInit(me, nid, x, y, z)
		}
	}

	var itemCount uint16
	binary.Read(dat, binary.LittleEndian, &itemCount)
	for t := uint16(0); t < itemCount; t++ {
		var uid uint16
		var nid uint16
		var x float32
		var y float32
		var z float32
		binary.Read(dat, binary.LittleEndian, &uid)
		binary.Read(dat, binary.LittleEndian, &nid)
		binary.Read(dat, binary.LittleEndian, &x)
		binary.Read(dat, binary.LittleEndian, &y)
		binary.Read(dat, binary.LittleEndian, &z)
		switch uid {
		case MedkitUID:
			medkitInit(me, nid, x, y, z)
		}
	}

	var missileCount uint16
	binary.Read(dat, binary.LittleEndian, &missileCount)
	for t := uint16(0); t < missileCount; t++ {
		var uid uint16
		var nid uint16
		var x float32
		var y float32
		var z float32
		var dx float32
		var dy float32
		var dz float32
		binary.Read(dat, binary.LittleEndian, &uid)
		binary.Read(dat, binary.LittleEndian, &nid)
		binary.Read(dat, binary.LittleEndian, &x)
		binary.Read(dat, binary.LittleEndian, &y)
		binary.Read(dat, binary.LittleEndian, &z)
		binary.Read(dat, binary.LittleEndian, &dx)
		binary.Read(dat, binary.LittleEndian, &dy)
		binary.Read(dat, binary.LittleEndian, &dz)
		switch uid {
		case PlasmaUID:
			var damage uint16
			binary.Read(dat, binary.LittleEndian, &damage)
			plasmaInit(me, nid, damage, x, y, z, dx, dy, dz)
		}
	}

	me.build()
}

func (me *world) build() {
	for i := 0; i < me.all; i++ {
		b := me.blocks[i]
		for j := 0; j < b.lightCount; j++ {
			computeLight(me, b, b.lights[j])
		}
	}
	for i := 0; i < me.all; i++ {
		me.blocks[i].buildMesh(me)
	}
}

func (me *world) addThing(t *Thing) {
}

func (me *world) removeThing(t *Thing) {
}

func (me *world) addItem(t *Item) {
}

func (me *world) removeItem(t *Item) {
}

func (me *world) addMissile(t *Missile) {
}

func (me *world) update() {
}
