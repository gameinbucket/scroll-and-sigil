package main

import (
	"bytes"
	"encoding/binary"
)

// NewTree func
func NewTree(world *World, x, y, z float32) *thing {
	tree := &thing{}
	tree.UID = TreeUID
	tree.NID = NextNID()
	tree.World = world
	tree.Update = tree.NopUpdate
	tree.Damage = tree.NopDamage
	tree.Save = tree.ScenerySave
	tree.Snap = tree.NopSnap
	tree.X = x
	tree.Y = y
	tree.Z = z
	tree.Radius = 0.4
	tree.Height = 1.0
	tree.Health = 1
	world.addThing(tree)
	tree.blockBorders()
	tree.addToBlocks()
	return tree
	// TODO make scenery its own entity
}

// ScenerySave func
func (me *thing) ScenerySave(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, me.UID)
	binary.Write(raw, binary.LittleEndian, me.NID)
	binary.Write(raw, binary.LittleEndian, float32(me.X))
	binary.Write(raw, binary.LittleEndian, float32(me.Y))
	binary.Write(raw, binary.LittleEndian, float32(me.Z))
}
