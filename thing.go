package main

import (
	"math"
	"strconv"
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

// Thing variables
var (
	ThingNetworkNum = 0
)

// Thing struct
type Thing struct {
	World               *World
	UID                 string
	NID                 string
	Animation           int
	AnimationMod        int
	AnimationFrame      int
	X, Y, Z             float32
	Angle               float32
	DX, DY, DZ          float32
	OldX, OldZ          float32
	MinBX, MinBY, MinBZ int
	MaxBX, MaxBY, MaxBZ int
	Ground              bool
	Radius              float32
	Height              float32
	Speed               float32
	Health              int
	Update              func()
	Damage              func(int)
}

// NextNID func
func NextNID() string {
	ThingNetworkNum++
	return "nid" + strconv.Itoa(ThingNetworkNum)
}

// LoadNewThing func
func LoadNewThing(world *World, uid string, x, y, z float32) *Thing {
	switch uid {
	case "you":
		y := NewYou(world, x, y, z)
		world.You = y
		return y.Thing
	case "baron":
		return NewBaron(world, x, y, z).Thing
	case "tree":
		return NewTree(world, x, y, z)
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

					// TODO line intersection collision for non bounding box walls
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
			}
		}
	}
}

// TerrainCollisionY func
func (me *Thing) TerrainCollisionY() {
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

		tile := me.World.GetTileType(bx, by, bz, tx, ty, tz)
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
		me.DX = 0.0
	} else {
		if z < 0 {
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

// Integrate func
func (me *Thing) Integrate() {
	if me.DX != 0.0 || me.DZ != 0.0 {
		me.OldX = me.X
		me.OldZ = me.Z

		me.X += me.DX
		me.Z += me.DZ

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

		me.DX = 0.0
		me.DZ = 0.0
	}

	if !me.Ground || me.DY != 0.0 {
		me.DY -= Gravity
		me.Y += me.DY
		me.TerrainCollisionY()

		me.RemoveFromBlocks()
		me.BlockBorders()
		me.AddToBlocks()
	}
}
