package main

// NewTree func
func NewTree(world *World, x, y, z float32) *Thing {
	tree := &Thing{}
	tree.UID = "tree"
	tree.NID = NextNID()
	tree.World = world
	tree.Update = tree.SceneryUpdate
	tree.Damage = tree.SceneryDamage
	tree.X = x
	tree.Y = y
	tree.Z = z
	tree.Radius = 0.4
	tree.Height = 1.0
	world.AddThing(tree)
	tree.BlockBorders()
	tree.AddToBlocks()
	return tree
}

// SceneryUpdate func
func (me *Thing) SceneryUpdate() {
}

// SceneryDamage func
func (me *Thing) SceneryDamage(amount int) {
}
