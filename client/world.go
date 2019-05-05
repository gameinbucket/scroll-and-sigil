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
	g             *graphics.RenderSystem
	gl            js.Value
	width         int
	height        int
	length        int
	tileWidth     int
	tileHeight    int
	tileLength    int
	slice         int
	all           int
	blocks        []block
	occluder      *occluder
	spriteBuffer  map[string]*graphics.RenderBuffer
	spriteCount   map[string]int
	thingCount    int
	itemCount     int
	missileCount  int
	particleCount int
	things        []*thing
	items         []*item
	missiles      []*missile
	particles     []*particle
	netLookup     map[uint16]interface{}
	pid           uint16
}

func worldInit(g *graphics.RenderSystem, gl js.Value) *world {
	world := &world{}
	world.g = g
	world.gl = gl
	world.spriteBuffer = make(map[string]*graphics.RenderBuffer)
	return world
}

func (me *world) reset() {
	me.blocks = make([]block, me.all)
	me.spriteCount = make(map[string]int)
	me.thingCount = 0
	me.itemCount = 0
	me.missileCount = 0
	me.particleCount = 0
	me.things = make([]*thing, 0)
	me.items = make([]*item, 0)
	me.missiles = make([]*missile, 0)
	me.particles = make([]*particle, 0)
	me.netLookup = make(map[uint16]interface{})
}

func (me *world) load(raw []byte) {
	dat := bytes.NewReader(raw)

	var uint8ref uint8
	var uint16ref uint16

	// TODO binary.Read sucks, implement custom solution for client and server
	// https://github.com/golang/go/blob/master/src/encoding/binary/binary.go

	binary.Read(dat, binary.LittleEndian, &me.pid)

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
	me.occluder = occluderInit(me.all)

	bx := 0
	by := 0
	bz := 0
	for i := 0; i < me.all; i++ {
		me.blocks[i].blockInit(bx, by, bz)
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
		block := &me.blocks[i]
		binary.Read(dat, binary.LittleEndian, &uint8ref)
		notEmpty := uint8ref != 0
		if notEmpty {
			for t := 0; t < BlockAll; t++ {
				binary.Read(dat, binary.LittleEndian, &uint8ref)
				tileType := int(uint8ref)
				block.tiles[t].typeOf = tileType
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
			block.addLight(lightInit(x, y, z, rgb))
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
			if nid == me.pid {
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
		block := &me.blocks[i]
		for j := 0; j < block.lightCount; j++ {
			block.lights[j].addToWorld(me, block)
		}
		block.occlusion()
	}
	for i := 0; i < me.all; i++ {
		me.blocks[i].buildMesh(me)
	}
}

func (me *world) getTilePointer(bx, by, bz, tx, ty, tz int) *tile {
	for tx < 0 {
		tx += BlockSize
		bx--
	}
	for tx >= BlockSize {
		tx -= BlockSize
		bx++
	}
	for ty < 0 {
		ty += BlockSize
		by--
	}
	for ty >= BlockSize {
		ty -= BlockSize
		by++
	}
	for tz < 0 {
		tz += BlockSize
		bz--
	}
	for tz >= BlockSize {
		tz -= BlockSize
		bz++
	}
	block := me.getBlock(bx, by, bz)
	if block == nil {
		return nil
	}
	return &block.tiles[tx+ty*BlockSize+tz*BlockSlice]
}

func (me *world) getTileType(bx, by, bz, tx, ty, tz int) int {
	for tx < 0 {
		tx += BlockSize
		bx--
	}
	for tx >= BlockSize {
		tx -= BlockSize
		bx++
	}
	for ty < 0 {
		ty += BlockSize
		by--
	}
	for ty >= BlockSize {
		ty -= BlockSize
		by++
	}
	for tz < 0 {
		tz += BlockSize
		bz--
	}
	for tz >= BlockSize {
		tz -= BlockSize
		bz++
	}
	block := me.getBlock(bx, by, bz)
	if block == nil {
		return TileNone
	}
	return block.tiles[tx+ty*BlockSize+tz*BlockSlice].typeOf
}

func (me *world) getBlock(x, y, z int) *block {
	if x < 0 || x >= me.width {
		return nil
	}
	if y < 0 || y >= me.height {
		return nil
	}
	if z < 0 || z >= me.length {
		return nil
	}
	return &me.blocks[x+y*me.width+z*me.slice]
}

func (me *world) addThing(t *thing) {
	if me.thingCount == len(me.things) {
		array := make([]*thing, me.thingCount+5)
		copy(array, me.things)
		me.things = array
	}
	me.things[me.thingCount] = t
	me.thingCount++

	count, has := me.spriteCount[t.sid]
	if has {
		me.spriteCount[t.sid] = count + 1
		b := me.spriteBuffer[t.sid]
		if (count+2)*16 > len(b.Vertices) {
			b.RenderBufferExpand(me.gl)
		}
	} else {
		me.spriteCount[t.sid] = 1
		me.spriteBuffer[t.sid] = graphics.RenderBufferInit(me.gl, 3, 0, 2, 40, 60)
	}
}

func (me *world) addItem(t *item) {
	if me.itemCount == len(me.items) {
		array := make([]*item, me.itemCount+5)
		copy(array, me.items)
		me.items = array
	}
	me.items[me.itemCount] = t
	me.itemCount++

	me.netLookup[t.nid] = t

	count, has := me.spriteCount[t.sid]
	if has {
		me.spriteCount[t.sid] = count + 1
		b := me.spriteBuffer[t.sid]
		if (count+2)*16 > len(b.Vertices) {
			b.RenderBufferExpand(me.gl)
		}
	} else {
		me.spriteCount[t.sid] = 1
		me.spriteBuffer[t.sid] = graphics.RenderBufferInit(me.gl, 3, 0, 2, 40, 60)
	}
}

func (me *world) addMissile(t *missile) {
	if me.missileCount == len(me.missiles) {
		array := make([]*missile, me.missileCount+5)
		copy(array, me.missiles)
		me.missiles = array
	}
	me.missiles[me.missileCount] = t
	me.missileCount++

	me.netLookup[t.nid] = t

	count, has := me.spriteCount[t.sid]
	if has {
		me.spriteCount[t.sid] = count + 1
		b := me.spriteBuffer[t.sid]
		if (count+2)*16 > len(b.Vertices) {
			b.RenderBufferExpand(me.gl)
		}
	} else {
		me.spriteCount[t.sid] = 1
		me.spriteBuffer[t.sid] = graphics.RenderBufferInit(me.gl, 3, 0, 2, 40, 60)
	}
}

func (me *world) addParticle(t *particle) {
	if me.particleCount == len(me.particles) {
		array := make([]*particle, me.particleCount+5)
		copy(array, me.particles)
		me.particles = array
	}
	me.particles[me.particleCount] = t
	me.particleCount++

	count, has := me.spriteCount[t.sid]
	if has {
		me.spriteCount[t.sid] = count + 1
		b := me.spriteBuffer[t.sid]
		if (count+2)*16 > len(b.Vertices) {
			b.RenderBufferExpand(me.gl)
		}
	} else {
		me.spriteCount[t.sid] = 1
		me.spriteBuffer[t.sid] = graphics.RenderBufferInit(me.gl, 3, 0, 2, 40, 60)
	}
}

func (me *world) removeThing(t *thing) {
	size := me.thingCount
	for i := 0; i < size; i++ {
		if me.things[i] == t {
			me.things[i] = me.things[size-1]
			me.things[size-1] = nil
			me.thingCount--
			break
		}
	}
}

func (me *world) removeItem(t *item) {
	size := me.itemCount
	for i := 0; i < size; i++ {
		if me.items[i] == t {
			me.items[i] = me.items[size-1]
			me.items[size-1] = nil
			me.itemCount--
			break
		}
	}
}

func (me *world) removeMissile(t *missile) {
	size := me.missileCount
	for i := 0; i < size; i++ {
		if me.missiles[i] == t {
			me.missiles[i] = me.missiles[size-1]
			me.missiles[size-1] = nil
			me.missileCount--
			break
		}
	}
}

func (me *world) removeParticle(t *particle) {
	size := me.particleCount
	for i := 0; i < size; i++ {
		if me.particles[i] == t {
			me.particles[i] = me.particles[size-1]
			me.particles[size-1] = nil
			me.particleCount--
			break
		}
	}
}

func (me *world) update() {
	size := me.thingCount
	for i := 0; i < size; i++ {
		me.things[i].update()
	}
	size = me.missileCount
	for i := 0; i < size; i++ {
		if me.missiles[i].update() {
			me.missiles[i] = me.missiles[size-1]
			me.missiles[size-1] = nil
			me.missileCount--
			size--
			i--
		}
	}
	size = me.particleCount
	for i := 0; i < size; i++ {
		if me.particles[i].update() {
			me.particles[i] = me.particles[size-1]
			me.particles[size-1] = nil
			me.particleCount--
			size--
			i--
		}
	}
}

func (me *world) render(g *graphics.RenderSystem, x, y, z int, camX, camZ, camAngle float32) {
	gl := me.gl
	spriteBuffer := me.spriteBuffer
	occluder := me.occluder
	spriteSet := make(map[interface{}]bool)

	occluder.prepareFrustum(g)
	occluder.search(me, x, y, z)

	for _, buffer := range spriteBuffer {
		buffer.Zero()
	}

	g.SetProgram(gl, "texture-color3d")
	g.UpdateMvp(gl)
	g.SetTexture(gl, "tiles")

	size := occluder.viewNum
	for i := 0; i < size; i++ {
		block := occluder.viewable[i]
		block.renderThings(spriteSet, spriteBuffer, camX, camZ, camAngle)
		mesh := block.mesh
		if mesh.VertexPos == 0 {
			continue
		}

		graphics.RenderSystemBindVao(gl, mesh)

		if x == block.x {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldPositiveX], block.countSide[WorldPositiveX])
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldNegativeX], block.countSide[WorldNegativeX])
		} else if x > block.x {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldPositiveX], block.countSide[WorldPositiveX])
		} else {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldNegativeX], block.countSide[WorldNegativeX])
		}

		if y == block.y {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldPositiveY], block.countSide[WorldPositiveY])
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldNegativeY], block.countSide[WorldNegativeY])
		} else if y > block.y {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldPositiveY], block.countSide[WorldPositiveY])
		} else {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldNegativeY], block.countSide[WorldNegativeY])
		}

		if z == block.z {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldPositiveZ], block.countSide[WorldPositiveZ])
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldNegativeZ], block.countSide[WorldNegativeZ])
		} else if z > block.z {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldPositiveZ], block.countSide[WorldPositiveZ])
		} else {
			graphics.RenderSystemDrawRange(gl, block.beginSide[WorldNegativeZ], block.countSide[WorldNegativeZ])
		}
	}

	g.SetProgram(gl, "texture3d")
	g.UpdateMvp(gl)
	for name, buffer := range spriteBuffer {
		if buffer.VertexPos > 0 {
			g.SetTexture(gl, name)
			graphics.RenderSystemUpdateAndDraw(gl, buffer)
		}
	}
}
