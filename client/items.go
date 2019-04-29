package main

// Item struct
type Item struct {
	world               *world
	UID                 uint16
	NID                 uint16
	X, Y, Z             float32
	MinBX, MinBY, MinBZ int
	MaxBX, MaxBY, MaxBZ int
	Radius              float32
	Height              float32
}

// BlockBorders func
func (me *Item) BlockBorders() {
	me.MinBX = int((me.X - me.Radius) * InverseBlockSize)
	me.MinBY = int(me.Y * InverseBlockSize)
	me.MinBZ = int((me.Z - me.Radius) * InverseBlockSize)
	me.MaxBX = int((me.X + me.Radius) * InverseBlockSize)
	me.MaxBY = int((me.Y + me.Height) * InverseBlockSize)
	me.MaxBZ = int((me.Z + me.Radius) * InverseBlockSize)
}

// AddToBlocks func
func (me *Item) AddToBlocks() {

}

func (me *Item) removeFromBlocks() {

}

// Overlap func
func (me *Item) Overlap(b *Thing) bool {
	square := me.Radius + b.Radius
	return Abs(me.X-b.X) <= square && Abs(me.Z-b.Z) <= square
}

// Cleanup func
func (me *Item) Cleanup() {
	me.removeFromBlocks()
	me.world.removeItem(me)
}

// LoadNewItem func
func LoadNewItem(world *world, uid uint16, x, y, z float32) {
	switch uid {
	case MedkitUID:
		NewMedkit(world, x, y, z)
	}
}

// NewMedkit func
func NewMedkit(world *world, x, y, z float32) *Item {
	me := &Item{}
	me.world = world
	me.X = x
	me.Y = y
	me.Z = z
	me.Radius = 0.3
	me.Height = 0.3
	me.BlockBorders()
	me.AddToBlocks()
	me.UID = MedkitUID
	me.NID = NextNID()
	world.addItem(me)
	return me
}
