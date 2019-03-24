package main

import (
	"strconv"
	"strings"
)

// Missile struct
type Missile struct {
	World               *World
	UID                 string
	NID                 string
	X, Y, Z             float32
	DX, DY, DZ          float32
	MinBX, MinBY, MinBZ int
	MaxBX, MaxBY, MaxBZ int
	Radius              float32
	Height              float32
	Damage              int
	Hit                 func(thing *Thing)
}

// BlockBorders func
func (me *Missile) BlockBorders() {
	me.MinBX = int((me.X - me.Radius) * InverseBlockSize)
	me.MinBY = int(me.Y * InverseBlockSize)
	me.MinBZ = int((me.Z - me.Radius) * InverseBlockSize)
	me.MaxBX = int((me.X + me.Radius) * InverseBlockSize)
	me.MaxBY = int((me.Y + me.Height) * InverseBlockSize)
	me.MaxBZ = int((me.Z + me.Radius) * InverseBlockSize)
}

// AddToBlocks func
func (me *Missile) AddToBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				me.World.GetBlock(gx, gy, gz).AddMissile(me)
			}
		}
	}
}

// RemoveFromBlocks func
func (me *Missile) RemoveFromBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				me.World.GetBlock(gx, gy, gz).RemoveMissile(me)
			}
		}
	}
}

// Overlap func
func (me *Missile) Overlap(b *Thing) bool {
	square := me.Radius + b.Radius
	return Abs(me.X-b.X) <= square && Abs(me.Z-b.Z) <= square
}

// Collision func
func (me *Missile) Collision() bool {
	searched := make(map[*Thing]bool)
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				block := me.World.GetBlock(gx, gy, gz)
				for t := 0; t < block.ThingCount; t++ {
					thing := block.Things[t]
					if thing.Health > 0 {
						if _, ok := searched[thing]; !ok {
							searched[thing] = true
							if me.Overlap(thing) {
								me.Hit(thing)
								return true
							}
						}
					}
				}
			}
		}
	}
	minGX := int((me.X - me.Radius))
	minGY := int(me.Y)
	minGZ := int((me.Z - me.Radius))
	maxGX := int((me.X + me.Radius))
	maxGY := int((me.Y + me.Height))
	maxGZ := int((me.Z + me.Radius))
	for gx := minGX; gx <= maxGX; gx++ {
		for gy := minGY; gy <= maxGY; gy++ {
			for gz := minGZ; gz <= maxGZ; gz++ {
				bx := int(float32(gx) * InverseBlockSize)
				by := int(float32(gy) * InverseBlockSize)
				bz := int(float32(gz) * InverseBlockSize)
				tx := gx - bx*BlockSize
				ty := gy - by*BlockSize
				tz := gz - bz*BlockSize
				tile := me.World.GetTileType(bx, by, bz, tx, ty, tz)
				if TileClosed[tile] {
					me.Hit(nil)
					return true
				}
			}
		}
	}
	return false
}

// Update func
func (me *Missile) Update() bool {
	if me.Collision() {
		return true
	}
	me.RemoveFromBlocks()
	me.X += me.DX
	me.Y += me.DY
	me.Z += me.DZ
	me.BlockBorders()
	me.AddToBlocks()
	return me.Collision()
}

// Snap func
func (me *Missile) Snap(snap *strings.Builder) {
	snap.WriteString("{u:")
	snap.WriteString(me.UID)
	snap.WriteString(",n:")
	snap.WriteString(me.NID)
	snap.WriteString(",x:")
	snap.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	snap.WriteString(",y:")
	snap.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	snap.WriteString(",z:")
	snap.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	snap.WriteString(",dx:")
	snap.WriteString(strconv.FormatFloat(float64(me.DX), 'f', -1, 32))
	snap.WriteString(",dy:")
	snap.WriteString(strconv.FormatFloat(float64(me.DY), 'f', -1, 32))
	snap.WriteString(",dz:")
	snap.WriteString(strconv.FormatFloat(float64(me.DZ), 'f', -1, 32))
	snap.WriteString("},")
}

// NewPlasma func
func NewPlasma(world *World, damage int, x, y, z, dx, dy, dz float32) *Missile {
	me := &Missile{}
	me.UID = "plasma"
	me.NID = NextNID()
	me.World = world
	me.X = x
	me.Y = y
	me.Z = z
	me.DX = dx
	me.DY = dy
	me.DZ = dz
	me.Radius = 0.2
	me.Height = 0.2
	me.Damage = damage
	me.Hit = me.PlasmaHit
	world.AddMissile(me)
	me.BlockBorders()
	me.AddToBlocks()

	me.Snap(&me.World.Snapshot)

	return me
}

// PlasmaHit func
func (me *Missile) PlasmaHit(thing *Thing) {
	me.X -= me.DX
	me.Y -= me.DY
	me.Z -= me.DZ
	if thing != nil {
		thing.Damage(1)
	}
	NewPlasmaExplosion(me.World, me.X, me.Y, me.Z)
	me.RemoveFromBlocks()
}
