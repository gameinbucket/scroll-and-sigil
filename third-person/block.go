package main

import (
	"strconv"
	"strings"
)

// Block constants
const (
	BlockShift       = 4
	BlockSize        = 8
	InverseBlockSize = 1.0 / BlockSize
	BlockSlice       = BlockSize * BlockSize
	BlockAll         = BlockSlice * BlockSize
)

// Block struct
type Block struct {
	X, Y, Z    int
	Tiles      [BlockAll]int
	Things     []*Thing
	ThingCount int
	Lights     []int
}

// NewBlock func
func NewBlock(x, y, z int) *Block {
	b := &Block{X: x, Y: y, Z: z}
	b.Things = make([]*Thing, 5)
	return b
}

// Save func
func (me *Block) Save(data *strings.Builder) {
	data.WriteString("{x:")
	data.WriteString(strconv.Itoa(me.X))
	data.WriteString(",y:")
	data.WriteString(strconv.Itoa(me.Y))
	data.WriteString(",z:")
	data.WriteString(strconv.Itoa(me.Z))
	data.WriteString(",t[")
	data.WriteString(strconv.FormatInt(int64(me.Tiles[0]), 10))
	for i := 1; i < BlockAll; i++ {
		data.WriteString(",")
		data.WriteString(strconv.FormatInt(int64(me.Tiles[i]), 10))
	}
	data.WriteString("],e[")
	if me.ThingCount > 0 {
		x := float32(me.X * BlockSize)
		y := float32(me.Y * BlockSize)
		z := float32(me.Z * BlockSize)
		me.Things[0].Save(data, x, y, z)
		for i := 1; i < me.ThingCount; i++ {
			data.WriteString(",")
			me.Things[i].Save(data, x, y, z)
		}
	}
	data.WriteString("]}")
}

// IsEmpty func
func (me *Block) IsEmpty() bool {
	if me.ThingCount > 0 {
		return false
	}
	for i := 0; i < BlockAll; i++ {
		if me.Tiles[i] != TileNone {
			return false
		}
	}
	return true
}

// GetTileTypeUnsafe func
func (me *Block) GetTileTypeUnsafe(x, y, z int) int {
	return me.Tiles[x+y*BlockSize+z*BlockSlice]
}

// AddThing func
func (me *Block) AddThing(t *Thing) {
	if me.ThingCount == len(me.Things) {
		array := make([]*Thing, me.ThingCount+5)
		copy(array, me.Things)
		me.Things = array
	}
	me.Things[me.ThingCount] = t
	me.ThingCount++
}

// RemoveThing func
func (me *Block) RemoveThing(t *Thing) {
	for i := 0; i < me.ThingCount; i++ {
		if me.Things[i] == t {
			for j := i; j < me.ThingCount-1; j++ {
				me.Things[j] = me.Things[j+1]
			}
			me.ThingCount--
			return
		}
	}
}
