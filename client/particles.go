package main

import (
	"math"

	"./graphics"
	"./render"
)

var (
	plasmaExplosionAnimation []*render.Sprite
)

type particle struct {
	world  *world
	SID    string
	sprite *render.Sprite
	x      float32
	y      float32
	z      float32
	deltaX float32
	deltaY float32
	deltaZ float32
	minBX  int
	minBY  int
	minBZ  int
	maxBX  int
	maxBY  int
	maxBZ  int
	radius float32
	height float32
}

func (me *particle) blockBorders() {
	me.minBX = int((me.x - me.radius) * InverseBlockSize)
	me.minBY = int(me.y * InverseBlockSize)
	me.minBZ = int((me.z - me.radius) * InverseBlockSize)
	me.maxBX = int((me.x + me.radius) * InverseBlockSize)
	me.maxBY = int((me.y + me.height) * InverseBlockSize)
	me.maxBZ = int((me.z + me.radius) * InverseBlockSize)
}

func (me *particle) addToBlocks() {
	for gx := me.minBX; gx <= me.maxBX; gx++ {
		for gy := me.minBY; gy <= me.maxBY; gy++ {
			for gz := me.minBZ; gz <= me.maxBZ; gz++ {
				block := me.world.getBlock(gx, gy, gz)
				block.addParticle(me)
			}
		}
	}
}

func (me *particle) collision() bool {
	minGX := int(me.x - me.radius)
	minGY := int(me.y)
	minGZ := int(me.z - me.radius)
	maxGX := int(me.x + me.radius)
	maxGY := int(me.y + me.height)
	maxGZ := int(me.z + me.radius)
	for gx := minGX; gx <= maxGX; gx++ {
		for gy := minGY; gy <= maxGY; gy++ {
			for gz := minGZ; gz <= maxGZ; gz++ {
				bx := int(float32(gx) * InverseBlockSize)
				by := int(float32(gy) * InverseBlockSize)
				bz := int(float32(gz) * InverseBlockSize)
				tx := gx - bx*BlockSize
				ty := gy - by*BlockSize
				tz := gz - bz*BlockSize
				tile := me.world.getTileType(bx, by, bz, tx, ty, tz)
				if TileClosed[tile] {
					return true
				}
			}
		}
	}
	return false
}

func (me *particle) removeFromBlocks() {
	for gx := me.minBX; gx <= me.maxBX; gx++ {
		for gy := me.minBY; gy <= me.maxBY; gy++ {
			for gz := me.minBZ; gz <= me.maxBZ; gz++ {
				block := me.world.getBlock(gx, gy, gz)
				block.removeParticle(me)
			}
		}
	}
}

func (me *particle) update() {
}

func (me *particle) render(spriteBuffer map[string]*graphics.RenderBuffer, camX, camZ float32) {
	sin := float64(camX - me.x)
	cos := float64(camZ - me.z)
	length := math.Sqrt(sin*sin + cos*cos)
	sin /= length
	cos /= length
	render.RendSprite(spriteBuffer[me.SID], me.x, me.y, me.z, float32(sin), float32(cos), me.sprite)
}

func plasmaExplosionInit(w *world, x, y, z float32) {
}
