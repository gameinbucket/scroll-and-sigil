package main

import (
	"math"
	"strconv"
	"strings"
)

// Thing constants
const (
	AnimationRate = 8
	Gravity       = 0.01
)

// Thing variables
var (
	ThingNetworkNum = 0
)

// Thing struct
type Thing struct {
	UID                    string
	SID                    string
	NID                    string
	Animations             map[string]string
	SpriteData             map[string]string
	AnimationFrame         int
	AnimationMod           int
	SpriteName             string
	Sprite                 map[string]string
	Angle                  float32
	X, Y, Z                float32
	DX, DY, DZ             float32
	OldX, OldZ             float32
	LowGX, LowGY, LowGZ    int
	HighGX, HighGY, HighGZ int
	Ground                 bool
	Radius                 float32
	Height                 float32
}

// NewThing func
func NewThing(world *World, uid, sid string, x, y, z, radius, height float32) *Thing {
	nid := "nid" + strconv.Itoa(ThingNetworkNum)
	ThingNetworkNum++
	t := &Thing{UID: uid, SID: sid, NID: nid, X: x, Y: y, Z: z, Radius: radius, Height: height}
	t.SpriteName = "idle"
	world.AddThing(t)
	t.BlockBorders()
	t.AddToBlocks(world)
	if uid == "you" {
	} else if uid == "wander" {
		thinker := &Think{Thing: t, Think: ThinkWander}
		world.AddThinker(thinker)
	}
	return t
}

// LoadNewThing func
func LoadNewThing(world *World, uid string, x, y, z float32) *Thing {
	switch uid {
	case "you":
		return NewThing(world, uid, "you", x, y, z, 0.01, 1.0)
	case "skeleton":
		return NewThing(world, uid, "skeleton", x, y, z, 0.01, 1.0)
	}
	return nil
}

// Save func
func (me *Thing) Save(data *strings.Builder, x, y, z float32) {
	data.WriteString("{u:")
	data.WriteString(me.UID)
	data.WriteString(",n:")
	data.WriteString(me.NID)
	data.WriteString(",x:")
	data.WriteString(strconv.FormatFloat(float64(me.X-x), 'f', -1, 32))
	data.WriteString(",y:")
	data.WriteString(strconv.FormatFloat(float64(me.Y-y), 'f', -1, 32))
	data.WriteString(",z:")
	data.WriteString(strconv.FormatFloat(float64(me.Z-z), 'f', -1, 32))
	data.WriteString("}")
}

// BlockBorders func
func (me *Thing) BlockBorders() {
	me.LowGX = int((me.X - me.Radius) * InverseBlockSize)
	me.LowGY = int(me.Y * InverseBlockSize)
	me.LowGZ = int((me.Z - me.Radius) * InverseBlockSize)
	me.HighGX = int((me.X + me.Radius) * InverseBlockSize)
	me.HighGY = int((me.Y + me.Height) * InverseBlockSize)
	me.HighGZ = int((me.Z + me.Radius) * InverseBlockSize)
}

// AddToBlocks func
func (me *Thing) AddToBlocks(world *World) {
	for gx := me.LowGX; gx <= me.HighGX; gx++ {
		for gy := me.LowGY; gy <= me.HighGY; gy++ {
			for gz := me.LowGZ; gz <= me.HighGZ; gz++ {
				world.GetBlock(gx, gy, gz).AddThing(me)
			}
		}
	}
}

// RemoveFromBlocks func
func (me *Thing) RemoveFromBlocks(world *World) {
	for gx := me.LowGX; gx <= me.HighGX; gx++ {
		for gy := me.LowGY; gy <= me.HighGY; gy++ {
			for gz := me.LowGZ; gz <= me.HighGZ; gz++ {
				world.GetBlock(gx, gy, gz).RemoveThing(me)
			}
		}
	}
}

// Animate func
func (me *Thing) Animate() {
	me.AnimationMod++
	if me.AnimationMod == AnimationRate {
		me.AnimationMod = 0
		me.AnimationFrame++
		if me.AnimationFrame == len(me.Animations) {
			me.AnimationFrame = 0
		}
	}
}

// TerrainCollisionY func
func (me *Thing) TerrainCollisionY(world *World) {
	if me.DY < 0 {
		gx := int(me.X)
		gy := int(me.Y)
		gz := int(me.Z)
		bx := int(me.X * InverseBlockSize)
		by := int(me.Y * InverseBlockSize)
		bz := int(me.Z * InverseBlockSize)
		tx := gx - bx*BlockSize
		ty := gy - by*BlockSize
		tz := gz - bz*BlockSize

		tile := world.GetTileType(bx, by, bz, tx, ty, tz)
		if TileClosed[tile] {
			me.Y = float32(gy + 1)
			me.Ground = true
			me.DY = 0
		}
	}
}

// Resolve func
func (me *Thing) Resolve(b *Thing) {
	square := me.Radius + b.Radius
	absx := me.X - b.X
	if absx < 0 {
		absx = -absx
	}
	absz := me.Z - b.Z
	if absz < 0 {
		absz = -absz
	}
	if absx > square || absz > square {
		return
	}
	absx = me.OldX - b.X
	if absx < 0 {
		absx = -absx
	}
	absz = me.OldZ - b.Z
	if absz < 0 {
		absz = -absz
	}
	if absx > absz {
		if me.OldX-b.X < 0 {
			me.X = b.X - square
		} else {
			me.X = b.X + square
		}
		me.DX = 0.0
	} else {
		if me.OldZ-b.Z < 0 {
			me.Z = b.Z - square
		} else {
			me.Z = b.Z + square
		}
		me.DZ = 0.0
	}
}

// Overlap func
func (me *Thing) Overlap(b *Thing) bool {
	square := me.Radius + b.Radius
	absx := me.X - b.X
	if absx < 0 {
		absx = -absx
	}
	absz := me.Z - b.Z
	if absz < 0 {
		absz = -absz
	}
	return absx <= square && absz <= square
}

// Update func
func (me *Thing) Update(world *World) {
	if me.DX != 0.0 || me.DZ != 0.0 {
		me.OldX = me.X
		me.OldZ = me.Z

		me.X += me.DX
		me.Z += me.DZ

		collided := make([]*Thing, 0)
		searched := make(map[*Thing]bool)

		me.RemoveFromBlocks(world)

		for gx := me.LowGX; gx <= me.HighGX; gx++ {
			for gy := me.LowGY; gy <= me.HighGY; gy++ {
				for gz := me.LowGZ; gz <= me.HighGZ; gz++ {
					block := world.GetBlock(gx, gy, gz)
					for t := 0; t < block.ThingCount; t++ {
						thing := block.Things[t]
						if _, ok := searched[thing]; !ok {
							searched[thing] = true
							if me.Overlap(thing) {
								collided = append(collided, thing)
							}
						}
					}
				}
			}
		}

		for len(collided) > 0 {
			closest := 0
			manhattan := float32(math.MaxFloat32)
			for i := 0; i < len(collided); i++ {
				thing := collided[i]
				absx := me.OldX - thing.X
				if absx < 0 {
					absx = -absx
				}
				absz := me.OldZ - thing.Z
				if absz < 0 {
					absz = -absz
				}
				dist := absx + absz
				if dist < manhattan {
					manhattan = dist
					closest = i
				}
			}
			me.Resolve(collided[closest])
			copy(collided[closest:], collided[closest+1:])
			collided[len(collided)-1] = nil
			collided = collided[:len(collided)-1]
		}

		me.BlockBorders()
		me.AddToBlocks(world)

		me.DX = 0.0
		me.DZ = 0.0
	}

	if !me.Ground || me.DY != 0.0 {
		me.DY -= Gravity
		me.Y += me.DY
		me.TerrainCollisionY(world)

		me.RemoveFromBlocks(world)
		me.BlockBorders()
		me.AddToBlocks(world)
	}

	me.Animate()

	world.Snapshot.WriteString("{n:")
	world.Snapshot.WriteString(me.NID)
	world.Snapshot.WriteString(",x:")
	world.Snapshot.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	world.Snapshot.WriteString(",y:")
	world.Snapshot.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	world.Snapshot.WriteString(",z:")
	world.Snapshot.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	world.Snapshot.WriteString("},")
}
