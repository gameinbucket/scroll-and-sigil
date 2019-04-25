package main

import (
	"bytes"
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
	MedkitUID = uint16(4)
)

// Group constants
const (
	NoGroup    = 0
	HumanGroup = 1
	DemonGroup = 2
)

// Thing variables
var (
	ThingNetworkNum = uint16(0)
)

// Thing struct
type Thing struct {
	World                  *World
	UID                    uint16
	NID                    uint16
	Animation              int
	AnimationFrame         int
	X, Y, Z                float32
	Angle                  float32
	DeltaX, DeltaY, DeltaZ float32
	OldX, OldZ             float32
	MinBX, MinBY, MinBZ    int
	MaxBX, MaxBY, MaxBZ    int
	Ground                 bool
	Radius                 float32
	Height                 float32
	Speed                  float32
	Health                 int
	Group                  int
	DeltaMoveXZ            bool
	DeltaMoveY             bool
	Update                 func() bool
	Damage                 func(int)
	Save                   func(raw *bytes.Buffer)
	Snap                   func(raw *bytes.Buffer)
	Binary                 []byte
}

// NextNID func
func NextNID() uint16 {
	ThingNetworkNum++
	return ThingNetworkNum
}

// LoadNewThing func
func LoadNewThing(world *World, uid uint16, x, y, z float32) {

}

// NopUpdate func
func (me *Thing) NopUpdate() bool {
	return false
}

// NopSnap func
func (me *Thing) NopSnap(raw *bytes.Buffer) {
	me.Binary = nil
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

}

// RemoveFromBlocks func
func (me *Thing) RemoveFromBlocks() {
}

// UpdateAnimation func
func (me *Thing) UpdateAnimation() int {
	me.AnimationFrame++
	if me.AnimationFrame == me.Animation-AnimationRate {
		return AnimationAlmostDone
	} else if me.AnimationFrame == me.Animation {
		return AnimationDone
	}
	return AnimationNotDone
}

// TerrainCollisionXZ func
func (me *Thing) TerrainCollisionXZ() {

}

// TerrainCollisionY func
func (me *Thing) TerrainCollisionY() {

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

// TryOverlap func
func (me *Thing) TryOverlap(x, z float32, b *Thing) bool {
	square := me.Radius + b.Radius
	return Abs(x-b.X) <= square && Abs(z-b.Z) <= square
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
