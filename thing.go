package main

import (
	"bytes"
	"math"
	"strings"
)

// Thing constants
const (
	AnimationRate       = 5
	Gravity             = 0.01
	AnimationNotDone    = 0
	AnimationAlmostDone = 1
	AnimationDone       = 2
)

// UID constants
const (
	HumanUID  = uint16(0)
	BaronUID  = uint16(1)
	TreeUID   = uint16(2)
	PlasmaUID = uint16(3)
)

// Thing variables
var (
	ThingNetworkNum = uint16(0)
)

// Thing struct
type Thing struct {
	World               *World
	UID                 uint16
	NID                 uint16
	Animation           int
	AnimationMod        int
	AnimationFrame      int
	X, Y, Z             float32
	Angle               float32
	DeltaX, DeltaY, DeltaZ          float32
	OldX, OldZ          float32
	MinBX, MinBY, MinBZ int
	MaxBX, MaxBY, MaxBZ int
	Ground              bool
	Radius              float32
	Height              float32
	Speed               float32
	Health              int
	DeltaMoveXZ         bool
	DeltaMoveY          bool
	Update              func() bool
	Damage              func(int)
	Save                func(data *strings.Builder)
	BinarySave          func(raw *bytes.Buffer)
	Snap                func(raw *bytes.Buffer) int
}

// NextNID func
func NextNID() uint16 {
	ThingNetworkNum++
	return ThingNetworkNum
}

// LoadNewThing func
func LoadNewThing(world *World, uid string, x, y, z float32) *Thing {
	switch uid {
	case "spawn":
		world.SpawnYouX = x
		world.SpawnYouY = y
		world.SpawnYouZ = z
	case "baron":
		return NewBaron(world, x, y, z).Thing
	case "tree":
		return NewTree(world, x, y, z)
	}
	return nil
}

// NopUpdate func
func (me *Thing) NopUpdate() bool {
	return false
}

// NopSnap func
func (me *Thing) NopSnap(raw *bytes.Buffer) int {
	return 0
}

// NopDamage func
func (me *Thing) NopDamage(amount int) {
}

// BlockBorders func
func (me *Thing) BlockBorders() {
	me.MinBX = int((me.X - me.Radius) * InverseBlockSize)
	me.MinBY = int(me.Y * InverseBlockSize)
	me.MinBZ = int((me.Z - me.Radius) * InverseBlockSize)
	me.MaxBX = int((me.X + me.Radius) * InverseBlockSize)
	me.MaxBY = int((me.Y + me.Height) * InverseBlockSize)
	me.MaxBZ = int((me.Z + me.Radius) * InverseBlockSize)
}

// AddToBlocks func
func (me *Thing) AddToBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				me.World.GetBlock(gx, gy, gz).AddThing(me)
			}
		}
	}
}

// RemoveFromBlocks func
func (me *Thing) RemoveFromBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				me.World.GetBlock(gx, gy, gz).RemoveThing(me)
			}
		}
	}
}

// UpdateAnimation func
func (me *Thing) UpdateAnimation() int {
	me.AnimationMod++
	if me.AnimationMod == AnimationRate {
		me.AnimationMod = 0
		me.AnimationFrame++
		if me.AnimationFrame == me.Animation-1 {
			return AnimationAlmostDone
		} else if me.AnimationFrame == me.Animation {
			return AnimationDone
		}
	}
	return AnimationNotDone
}

// TerrainCollisionXZ func
func (me *Thing) TerrainCollisionXZ() {
	minGX := int((me.X - me.Radius))
	minGY := int(me.Y)
	minGZ := int((me.Z - me.Radius))
	maxGX := int((me.X + me.Radius))
	maxGY := int((me.Y + me.Height))
	maxGZ := int((me.Z + me.Radius))

	minBX := int(float32(minGX) * InverseBlockSize)
	minBY := int(float32(minGY) * InverseBlockSize)
	minBZ := int(float32(minGZ) * InverseBlockSize)

	minTX := minGX - minBX*BlockSize
	minTY := minGY - minBY*BlockSize
	minTZ := minGZ - minBZ*BlockSize

	world := me.World

	bx := minBX
	tx := minTX
	for gx := minGX; gx <= maxGX; gx++ {
		by := minBY
		ty := minTY
		for gy := minGY; gy <= maxGY; gy++ {
			bz := minBZ
			tz := minTZ
			for gz := minGZ; gz <= maxGZ; gz++ {
				block := world.GetBlock(bx, by, bz)
				tile := block.GetTileTypeUnsafe(tx, ty, tz)
				if TileClosed[tile] {
					xx := float32(gx)
					closeX := me.X
					if closeX < xx {
						closeX = xx
					} else if closeX > xx+1 {
						closeX = xx + 1
					}

					zz := float32(gz)
					closeZ := me.Z
					if closeZ < zz {
						closeZ = zz
					} else if closeZ > zz+1 {
						closeZ = zz + 1
					}

					dxx := me.X - closeX
					dzz := me.Z - closeZ
					dist := dxx*dxx + dzz*dzz

					if dist > me.Radius*me.Radius {
						continue
					}
					dist = float32(math.Sqrt(float64(dist)))
					if dist == 0 {
						dist = 1
					}
					mult := me.Radius / dist
					me.X += dxx*mult - dxx
					me.Z += dzz*mult - dzz
				}
				tz++
				if tz == BlockSize {
					tz = 0
					bz++
				}
			}
			ty++
			if ty == BlockSize {
				ty = 0
				by++
			}
		}
		tx++
		if tx == BlockSize {
			tx = 0
			bx++
		}
	}
}

// TerrainCollisionY func
func (me *Thing) TerrainCollisionY() {
	if me.DeltaY < 0 {
		gx := int(me.X)
		gy := int(me.Y)
		gz := int(me.Z)
		bx := int(me.X * InverseBlockSize)
		by := int(me.Y * InverseBlockSize)
		bz := int(me.Z * InverseBlockSize)
		tx := gx - bx*BlockSize
		ty := gy - by*BlockSize
		tz := gz - bz*BlockSize

		tile := me.World.GetTileType(bx, by, bz, tx, ty, tz)
		if TileClosed[tile] {
			me.Y = float32(gy + 1)
			me.Ground = true
			me.DeltaY = 0
		}
	}
}

// Resolve func
func (me *Thing) Resolve(b *Thing) {
	square := me.Radius + b.Radius
	absx := Abs(me.X - b.X)
	absz := Abs(me.Z - b.Z)
	if absx > square || absz > square {
		return
	}
	x := me.OldX - b.X
	z := me.OldZ - b.Z
	if Abs(x) > Abs(z) {
		if x < 0 {
			me.X = b.X - square
		} else {
			me.X = b.X + square
		}
		me.DeltaX = 0.0
	} else {
		if z < 0 {
			me.Z = b.Z - square
		} else {
			me.Z = b.Z + square
		}
		me.DeltaZ = 0.0
	}
}

// Overlap func
func (me *Thing) Overlap(b *Thing) bool {
	square := me.Radius + b.Radius
	return Abs(me.X-b.X) <= square && Abs(me.Z-b.Z) <= square
}

// ApproximateDistance func
func (me *Thing) ApproximateDistance(other *Thing) float32 {
	dx := Abs(me.X - other.X)
	dy := Abs(me.Z - other.Z)
	if dx > dy {
		return dx + dy - dy*0.5
	}
	return dx + dy - dx*0.5
}

// IntegrateXZ func
func (me *Thing) IntegrateXZ() {
	me.OldX = me.X
	me.OldZ = me.Z

	me.X += me.DeltaX
	me.Z += me.DeltaZ
	me.DeltaMoveXZ = true

	collided := make([]*Thing, 0)
	searched := make(map[*Thing]bool)

	me.RemoveFromBlocks()
	me.BlockBorders()

	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				block := me.World.GetBlock(gx, gy, gz)
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
			dist := Abs(me.OldX-thing.X) + Abs(me.OldZ-thing.Z)
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

	me.TerrainCollisionXZ()

	me.BlockBorders()
	me.AddToBlocks()

	me.DeltaX = 0.0
	me.DeltaZ = 0.0
}

// IntegrateY func
func (me *Thing) IntegrateY() {
	if !me.Ground {
		me.DeltaY -= Gravity
		me.Y += me.DeltaY
		me.DeltaMoveY = true
		me.TerrainCollisionY()

		me.RemoveFromBlocks()
		me.BlockBorders()
		me.AddToBlocks()
	}
}
