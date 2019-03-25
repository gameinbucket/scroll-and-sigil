package main

import (
	"strconv"
	"strings"
)

// Block constants
const (
	BlockSize        = 8
	InverseBlockSize = 1.0 / BlockSize
	BlockSlice       = BlockSize * BlockSize
	BlockAll         = BlockSlice * BlockSize
)

// Block struct
type Block struct {
	X, Y, Z      int
	Tiles        [BlockAll]int
	ThingCount   int
	ItemCount    int
	MissileCount int
	Things       []*Thing
	Items        []*Item
	Missiles     []*Missile
	Lights       []*Light
	LightCount   int
}

// NewBlock func
func NewBlock(x, y, z int) *Block {
	b := &Block{X: x, Y: y, Z: z}
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
	if me.NotEmpty() {
		for i := 0; i < BlockAll; i++ {
			data.WriteString(strconv.FormatInt(int64(me.Tiles[i]), 10))
			data.WriteString(",")
		}
	}
	data.WriteString("],e[")
	for i := 0; i < me.ThingCount; i++ {
		me.Things[i].Save(data)
		data.WriteString(",")
	}
	data.WriteString("],i[")
	for i := 0; i < me.ItemCount; i++ {
		me.Items[i].Save(data)
		data.WriteString(",")
	}
	data.WriteString("],m[")
	for i := 0; i < me.MissileCount; i++ {
		me.Missiles[i].Snap(data)
		data.WriteString(",")
	}
	data.WriteString("],c[")
	for i := 0; i < me.LightCount; i++ {
		me.Lights[i].Save(data)
		data.WriteString(",")
	}
	data.WriteString("]}")
}

// NotEmpty func
func (me *Block) NotEmpty() bool {
	for i := 0; i < BlockAll; i++ {
		if me.Tiles[i] != TileNone {
			return true
		}
	}
	return false
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

// AddItem func
func (me *Block) AddItem(t *Item) {
	if me.ItemCount == len(me.Items) {
		array := make([]*Item, me.ItemCount+5)
		copy(array, me.Items)
		me.Items = array
	}
	me.Items[me.ItemCount] = t
	me.ItemCount++
}

// RemoveItem func
func (me *Block) RemoveItem(t *Item) {
	for i := 0; i < me.ItemCount; i++ {
		if me.Items[i] == t {
			for j := i; j < me.ItemCount-1; j++ {
				me.Items[j] = me.Items[j+1]
			}
			me.ItemCount--
			return
		}
	}
}

// AddMissile func
func (me *Block) AddMissile(t *Missile) {
	if me.MissileCount == len(me.Missiles) {
		array := make([]*Missile, me.MissileCount+5)
		copy(array, me.Missiles)
		me.Missiles = array
	}
	me.Missiles[me.MissileCount] = t
	me.MissileCount++
}

// RemoveMissile func
func (me *Block) RemoveMissile(t *Missile) {
	for i := 0; i < me.MissileCount; i++ {
		if me.Missiles[i] == t {
			for j := i; j < me.MissileCount-1; j++ {
				me.Missiles[j] = me.Missiles[j+1]
			}
			me.MissileCount--
			return
		}
	}
}

// AddLight func
func (me *Block) AddLight(t *Light) {
	if me.LightCount == len(me.Lights) {
		array := make([]*Light, me.LightCount+5)
		copy(array, me.Lights)
		me.Lights = array
	}
	me.Lights[me.LightCount] = t
	me.LightCount++
}

// RemoveLight func
func (me *Block) RemoveLight(t *Light) {
	for i := 0; i < me.LightCount; i++ {
		if me.Lights[i] == t {
			for j := i; j < me.LightCount-1; j++ {
				me.Lights[j] = me.Lights[j+1]
			}
			me.LightCount--
			return
		}
	}
}
