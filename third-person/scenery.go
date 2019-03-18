package main

// Scenery struct
type Scenery struct {
	*Thing
}

// NewTree func
func NewTree(world *World, x, y, z float32) *Scenery {
	t := &Scenery{}
	t.Thing = &Thing{}
	t.UID = "tree"
	t.NID = NextNID()
	t.World = world
	t.X = x
	t.Y = y
	t.Z = z
	t.Radius = 0.4
	t.Height = 1.0
	world.AddThing(t)
	t.BlockBorders()
	t.AddToBlocks()
	return t
}

// Damage func
func (me *Scenery) Damage(amount int) {
}

// Update func
func (me *Scenery) Update() {
}
