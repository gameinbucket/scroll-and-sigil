package main

import "math"

// Baron struct
type Baron struct {
	*Thing
	status string
}

// NewBaron func
func NewBaron(world *World, x, y, z float32) *Baron {
	nid := NextNID()
	t := &Baron{}
	t.Thing = &Thing{}
	t.UID = "baron"
	t.SID = "baron"
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
func (me *Baron) Update(world *World) {
	pace := float32(0.1)
	me.DX += float32(math.Sin(float64(me.Angle))) * pace
	me.DZ -= float32(math.Cos(float64(me.Angle))) * pace
	me.Integrate(world)
}
