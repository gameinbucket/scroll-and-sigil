package main

import (
	"bytes"
	"encoding/binary"
	"strconv"
	"strings"
)

// NewTree func
func NewTree(world *World, x, y, z float32) *Thing {
	tree := &Thing{}
	tree.UID = TreeUID
	tree.NID = NextNID()
	tree.World = world
	tree.Update = tree.NopUpdate
	tree.Damage = tree.NopDamage
	tree.Snap = tree.NopSnap
	tree.Save = tree.ScenerySave
	tree.BinarySnap = tree.NopSnapBinary
	tree.BinarySave = tree.ScenerySaveBinary
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
	snap.WriteString(strconv.Itoa(int(me.UID)))
	snap.WriteString(",n:")
	snap.WriteString(strconv.Itoa(int(me.NID)))
	snap.WriteString(",x:")
	snap.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	snap.WriteString(",y:")
	snap.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	snap.WriteString(",z:")
	snap.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	snap.WriteString("}")
}

// ScenerySaveBinary func
func (me *Thing) ScenerySaveBinary(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, me.UID)
	binary.Write(raw, binary.LittleEndian, me.NID)
	binary.Write(raw, binary.LittleEndian, float32(me.X))
	binary.Write(raw, binary.LittleEndian, float32(me.Y))
	binary.Write(raw, binary.LittleEndian, float32(me.Z))
}
