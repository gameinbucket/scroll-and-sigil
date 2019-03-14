package main

import (
	"math"
	"strconv"
	"strings"
)

// You struct
type You struct {
	*Thing
	person    *Person
	something int
}

// NewYou func
func NewYou(world *World, x, y, z float32) *You {
	nid := NextNID()
	t := &You{}
	t.Thing = &Thing{}
	t.UID = "you"
	t.SID = "you"
	t.NID = nid
	t.X = x
	t.Y = y
	t.Z = z
	t.Radius = 0.4
	t.Height = 1.0
	t.SpriteName = "idle"
	world.AddThing(t)
	t.BlockBorders()
	t.AddToBlocks(world)
	return t
}

// Update func
func (me *You) Update(world *World) {
	me.Integrate(world)
}

// ThinkYou func
func ThinkYou(me *Person, world *World) {
	if me.InputCount == 0 {
		return
	}

	thing := me.Character

	mf := false
	mb := false
	sl := false
	sr := false

	for i := 0; i < me.InputCount; i++ {
		input := me.InputQueue[i]

		if strings.HasPrefix(input, "a:") {
			angle := strings.Split(input, "a:")[1]
			value, _ := strconv.ParseFloat(angle, 32)
			thing.Angle = float32(value)
		}

		pace := float32(0.1)

		if !mf && input == "mf" {
			thing.DX += float32(math.Sin(float64(thing.Angle))) * pace
			thing.DZ -= float32(math.Cos(float64(thing.Angle))) * pace
			mf = true
		}

		if !mb && input == "mb" {
			thing.DX -= float32(math.Sin(float64(thing.Angle))) * pace
			thing.DZ += float32(math.Cos(float64(thing.Angle))) * pace
			mb = true
		}

		if !sl && input == "sl" {
			thing.DX -= float32(math.Cos(float64(thing.Angle))) * pace
			thing.DZ -= float32(math.Sin(float64(thing.Angle))) * pace
			sl = true
		}

		if !sr && input == "sr" {
			thing.DX += float32(math.Cos(float64(thing.Angle))) * pace
			thing.DZ += float32(math.Sin(float64(thing.Angle))) * pace
			sr = true
		}
	}
}
