package main

import (
	"./graphics"
)

// Constants
const (
	BlockSize        = 8
	InverseBlockSize = 1.0 / BlockSize
	BlockSlice       = BlockSize * BlockSize
	BlockAll         = BlockSlice * BlockSize

	BlockColorDim   = BlockSize + 1
	BlockColorSlice = BlockColorDim * BlockColorDim
)

// Variables
var (
	BlockMesh        *graphics.RenderCopy
	BlockMeshAmbient = [BlockAll][6][4]uint8{}
	BlockMeshColor   = [BlockColorDim * BlockColorSlice][3]uint8{}

	SliceX       = [6]int{2, 1, 0, 2, 1, 0}
	SliceY       = [6]int{0, 2, 1, 0, 2, 1}
	SliceZ       = [6]int{1, 0, 2, 1, 0, 2}
	SliceTowards = [6]int{1, 1, 1, -1, -1, -1}
	Slice        = [3]int{}
	SliceTemp    = [3]int{}
)

func setupBlocks() {
	BlockMesh = graphics.RenderCopyInit(3, 3, 2, BlockAll*6*4, BlockAll*6*6)

	for i := 0; i < len(BlockMeshColor); i++ {
		BlockMeshColor[i] = [3]uint8{}
	}
}

type block struct {
	x             int
	y             int
	z             int
	mesh          []byte
	visibility    [36]uint8
	beginSide     [6]int
	countSide     [6]int
	thingCount    int
	itemCount     int
	missileCount  int
	particleCount int
	lightCount    int
	things        []*thing
	items         []*item
	missiles      []*missile
	particles     []*particle
	lights        []*light
	tiles         [BlockAll]*tile
}

func blockInit(x, y, z int) *block {
	b := &block{}
	b.x = x
	b.y = y
	b.z = z
	for t := 0; t < BlockAll; t++ {
		b.tiles[t] = &tile{}
	}
	return b
}

func (me *block) save() string {
	data := "{t["
	if me.notEmpty() == 1 {
		for i := 0; i < BlockAll; i++ {
			data += string(me.tiles[i].typeOf)
			data += ","
		}
	}
	data += "],c["
	for i := 0; i < me.lightCount; i++ {
		data += me.lights[i].save()
		data += ","
	}
	data += "]}"
	return data
}

func (me *block) notEmpty() uint8 {
	for i := 0; i < BlockAll; i++ {
		if me.tiles[i].typeOf != TileNone {
			return 1
		}
	}
	return 0
}

func (me *block) getTilePointerUnsafe(x, y, z int) *tile {
	return me.tiles[x+y*BlockSize+z*BlockSlice]
}

func (me *block) getTileTypeUnsafe(x, y, z int) int {
	return me.tiles[x+y*BlockSize+z*BlockSlice].typeOf
}

func (me *block) addThing(t *thing) {
	if me.thingCount == len(me.things) {
		array := make([]*thing, me.thingCount+5)
		copy(array, me.things)
		me.things = array
	}
	me.things[me.thingCount] = t
	me.thingCount++
}

func (me *block) addItem(t *item) {
	if me.itemCount == len(me.items) {
		array := make([]*item, me.itemCount+5)
		copy(array, me.items)
		me.items = array
	}
	me.items[me.itemCount] = t
	me.itemCount++
}

func (me *block) addMissile(t *missile) {
	if me.missileCount == len(me.missiles) {
		array := make([]*missile, me.missileCount+5)
		copy(array, me.missiles)
		me.missiles = array
	}
	me.missiles[me.missileCount] = t
	me.missileCount++
}

func (me *block) addParticle(t *particle) {
	if me.particleCount == len(me.particles) {
		array := make([]*particle, me.particleCount+5)
		copy(array, me.particles)
		me.particles = array
	}
	me.particles[me.particleCount] = t
	me.particleCount++
}

func (me *block) addLight(t *light) {
	if me.lightCount == len(me.lights) {
		array := make([]*light, me.lightCount+5)
		copy(array, me.lights)
		me.lights = array
	}
	me.lights[me.lightCount] = t
	me.lightCount++
}

func (me *block) removeThing(t *thing) {
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

func (me *block) removeItem(t *item) {
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

func (me *block) removeMissile(t *missile) {
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

func (me *block) removeParticle(t *particle) {
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

func (me *block) removeLight(t *light) {
	size := me.lightCount
	for i := 0; i < size; i++ {
		if me.lights[i] == t {
			me.lights[i] = me.lights[size-1]
			me.lights[size-1] = nil
			me.lightCount--
			break
		}
	}
}

func (me *block) ambientMesh(w *world) {

}

func (me *block) colorMesh(w *world) {

}

func (me *block) determineLight(t *tile, color []int) {
	if t == nil {
		return
	}
	if !TileClosed[t.typeOf] {
		color[0] += int(t.red)
		color[1] += int(t.green)
		color[2] += int(t.blue)
		color[3]++
	}
}

func (me *block) lightOfSide(xs, ys, zs, side int) ([3]uint8, [3]uint8, [3]uint8, [3]uint8) {
	switch side {
	case WorldPositiveX:
		return BlockMeshColor[xs+1+ys*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+1+(ys+1)*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+1+(ys+1)*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+1+ys*BlockColorDim+(zs+1)*BlockColorSlice]

	case WorldNegativeX:
		return BlockMeshColor[xs+ys*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+ys*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+(ys+1)*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+(ys+1)*BlockColorDim+zs*BlockColorSlice]

	case WorldPositiveY:
		return BlockMeshColor[xs+(ys+1)*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+(ys+1)*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+1+(ys+1)*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+1+(ys+1)*BlockColorDim+zs*BlockColorSlice]

	case WorldNegativeY:
		return BlockMeshColor[xs+ys*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+1+ys*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+1+ys*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+ys*BlockColorDim+(zs+1)*BlockColorSlice]

	case WorldPositiveZ:
		return BlockMeshColor[xs+1+ys*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+1+(ys+1)*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+(ys+1)*BlockColorDim+(zs+1)*BlockColorSlice],
			BlockMeshColor[xs+ys*BlockColorDim+(zs+1)*BlockColorSlice]

	default:
		return BlockMeshColor[xs+ys*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+(ys+1)*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+1+(ys+1)*BlockColorDim+zs*BlockColorSlice],
			BlockMeshColor[xs+1+ys*BlockColorDim+zs*BlockColorSlice]
	}
}

func (me *block) buildMesh(w *world) {

}

func (me *block) renderThings(spriteSet map[*thing]bool, spriteBuffer map[string]*graphics.RenderBuffer, camX, camZ, camAngle float32) {
	for i := 0; i < me.thingCount; i++ {
		thing := me.things[i]
		if _, ok := spriteSet[thing]; ok {
			continue
		}
		spriteSet[thing] = true
		thing.render(spriteBuffer, camX, camZ, camAngle)
	}
	for i := 0; i < me.itemCount; i++ {
		item := me.items[i]
		if _, ok := spriteSet[item]; ok {
			continue
		}
		spriteSet[item] = true
		item.render(spriteBuffer, camX, camZ, camAngle)
	}
	for i := 0; i < me.missileCount; i++ {
		missile := me.missiles[i]
		if _, ok := spriteSet[missile]; ok {
			continue
		}
		spriteSet[missile] = true
		missile.render(spriteBuffer, camX, camZ, camAngle)
	}
	for i := 0; i < me.particleCount; i++ {
		particle := me.particles[i]
		if _, ok := spriteSet[particle]; ok {
			continue
		}
		spriteSet[particle] = true
		particle.render(spriteBuffer, camX, camZ)
	}
}
