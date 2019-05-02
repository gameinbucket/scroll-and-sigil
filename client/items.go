package main

import (
	"math"

	"./graphics"
	"./render"
)

type item struct {
	world  *world
	uid    uint16
	sid    string
	nid    uint16
	sprite *render.Sprite
	x      float32
	y      float32
	z      float32
	minBX  int
	minBY  int
	minBZ  int
	maxBX  int
	maxBY  int
	maxBZ  int
	radius float32
	height float32
}

func (me *item) blockBorders() {
	me.minBX = int((me.x - me.radius) * InverseBlockSize)
	me.minBY = int(me.y * InverseBlockSize)
	me.minBZ = int((me.z - me.radius) * InverseBlockSize)
	me.maxBX = int((me.x + me.radius) * InverseBlockSize)
	me.maxBY = int((me.y + me.height) * InverseBlockSize)
	me.maxBZ = int((me.z + me.radius) * InverseBlockSize)
}

func (me *item) addToBlocks() {
	for gx := me.minBX; gx <= me.maxBX; gx++ {
		for gy := me.minBY; gy <= me.maxBY; gy++ {
			for gz := me.minBZ; gz <= me.maxBZ; gz++ {
				block := me.world.getBlock(gx, gy, gz)
				block.addItem(me)
			}
		}
	}
}

func (me *item) removeFromBlocks() {
	for gx := me.minBX; gx <= me.maxBX; gx++ {
		for gy := me.minBY; gy <= me.maxBY; gy++ {
			for gz := me.minBZ; gz <= me.maxBZ; gz++ {
				block := me.world.getBlock(gx, gy, gz)
				block.removeItem(me)
			}
		}
	}
}

func (me *item) cleanup() {
	me.world.removeItem(me)
	me.removeFromBlocks()
}

func (me *item) render(spriteBuffer map[string]*graphics.RenderBuffer, camX, camZ, camAngle float32) {
	sin := float64(camX - me.x)
	cos := float64(camZ - me.z)
	length := math.Sqrt(sin*sin + cos*cos)
	sin /= length
	cos /= length
	render.RendSprite(spriteBuffer[me.sid], me.x, me.y, me.z, float32(sin), float32(cos), me.sprite)
}

func medkitInit(world *world, nid uint16, x, y, z float32) *item {
	me := &item{}
	me.world = world
	me.x = x
	me.y = y
	me.z = z
	me.blockBorders()
	me.addToBlocks()
	me.uid = MedkitUID
	me.nid = nid
	me.sprite = wadSpriteData[me.sid]["medkit"]
	me.radius = 0.2
	me.height = 0.2
	world.addItem(me)
	return me
}
