package main

import (
	"strconv"
	"strings"
)

// NewTree func
func NewTree(world *World, x, y, z float32) *Thing {
	tree := &Thing{}
	tree.UID = "tree"
	tree.NID = NextNID()
	tree.World = world
	tree.Update = tree.SceneryUpdate
	tree.Damage = tree.SceneryDamage
	tree.Save = tree.ScenerySave
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

// ScenerySave func
func (me *Thing) ScenerySave(snap *strings.Builder) {
	snap.WriteString("{u:")
	snap.WriteString(me.UID)
	snap.WriteString(",n:")
	snap.WriteString(me.NID)
	snap.WriteString(",x:")
	snap.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	snap.WriteString(",y:")
	snap.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	snap.WriteString(",z:")
	snap.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	snap.WriteString("}")
}

// SceneryUpdate func
func (me *Thing) SceneryUpdate() {
}

// SceneryDamage func
func (me *Thing) SceneryDamage(amount int) {
}
