package main

import (
	"bytes"
	"encoding/binary"
)

// Item struct
type Item struct {
	World               *World
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
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				block := me.World.GetBlock(gx, gy, gz)
				block.AddItem(me)
			}
		}
	}
}

// RemoveFromBlocks func
func (me *Item) RemoveFromBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				block := me.World.GetBlock(gx, gy, gz)
				if block != nil {
					block.RemoveItem(me)
				}
			}
		}
	}
}

// Save func
func (me *Item) Save(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, me.UID)
	binary.Write(raw, binary.LittleEndian, me.NID)
	binary.Write(raw, binary.LittleEndian, float32(me.X))
	binary.Write(raw, binary.LittleEndian, float32(me.Y))
	binary.Write(raw, binary.LittleEndian, float32(me.Z))
}

// LoadNewItem func
func LoadNewItem(world *World, uid uint16, x, y, z float32) {
	switch uid {
	case MedkitUID:
		NewMedkit(world, x, y, z)
	}
}

// NewMedkit func
func NewMedkit(world *World, x, y, z float32) *Item {
	me := &Item{}
	me.World = world
	me.X = x
	me.Y = y
	me.Z = z
	me.Radius = 0.3
	me.Height = 0.3
	me.BlockBorders()
	me.AddToBlocks()
	me.UID = MedkitUID
	me.NID = NextNID()
	world.AddItem(me)
	return me
}
