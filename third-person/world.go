package main

import (
	"encoding/json"
	"math"
	"strings"
)

// World constants
const (
	WorldPositiveX = 0
	WorldPositiveY = 1
	WorldPositiveZ = 2
	WorldNegativeX = 3
	WorldNegativeY = 4
	WorldNegativeZ = 5
)

// World variables
var (
	WorldThreads = []string{"ai", "pathing"}
)

// World struct
type World struct {
	Width       int
	Height      int
	Length      int
	Slice       int
	All         int
	Blocks      []*Block
	You         *Thing
	People      []*Person
	Things      []*Thing
	ThingCount  int
	Thinkers    []*Think
	ThinkCount  int
	ThreadIndex int
	ThreadID    string
	Snapshot    strings.Builder
}

// NewWorld func
func NewWorld() *World {
	w := &World{}
	return w
}

// Load func
func (me *World) Load(data []byte) {
	var content map[string]interface{}
	json.Unmarshal(data, &content)

	blocks := content["blocks"].([]interface{})

	left := math.MaxInt32
	right := math.MinInt32
	top := math.MinInt32
	bottom := math.MaxInt32
	front := math.MinInt32
	back := math.MaxInt32

	for b := 0; b < len(blocks); b++ {
		block := blocks[b].(map[string]interface{})
		bx := int(block["x"].(float64))
		by := int(block["y"].(float64))
		bz := int(block["z"].(float64))

		if bx < left {
			left = bx
		}
		if bx > right {
			right = bx
		}
		if by > top {
			top = by
		}
		if by < bottom {
			bottom = by
		}
		if bz > front {
			front = bz
		}
		if bz < back {
			back = bz
		}
	}

	me.Width = right - left + 1
	me.Height = top - bottom + 1
	me.Length = front - back + 1
	me.Slice = me.Width * me.Height
	me.All = me.Slice * me.Length
	me.Blocks = make([]*Block, me.All, me.All)

	for b := 0; b < len(blocks); b++ {
		bdata := blocks[b].(map[string]interface{})
		bx := int(bdata["x"].(float64)) - left
		by := int(bdata["y"].(float64)) - bottom
		bz := int(bdata["z"].(float64)) - back
		tiles := bdata["tiles"].([]interface{})

		block := NewBlock(bx, by, bz)
		if len(tiles) > 0 {
			for t := 0; t < BlockAll; t++ {
				block.Tiles[t] = int(tiles[t].(float64))
			}
		}
		me.Blocks[bx+by*me.Width+bz*me.Slice] = block
	}

	for x := 0; x < me.Width; x++ {
		for y := 0; y < me.Height; y++ {
			for z := 0; z < me.Length; z++ {
				i := x + y*me.Width + z*me.Slice
				if me.Blocks[i] == nil {
					me.Blocks[i] = NewBlock(x, y, z)
				}
			}
		}
	}

	me.People = make([]*Person, 0)
	me.Things = make([]*Thing, 5)
	me.ThingCount = 0
	me.Thinkers = make([]*Think, 5)
	me.ThinkCount = 0

	for b := 0; b < len(blocks); b++ {
		bdata := blocks[b].(map[string]interface{})
		bx := int(bdata["x"].(float64)) - left
		by := int(bdata["y"].(float64)) - bottom
		bz := int(bdata["z"].(float64)) - back
		things := bdata["things"].([]interface{})

		px := float32(bx * BlockSize)
		py := float32(by * BlockSize)
		pz := float32(bz * BlockSize)

		for t := 0; t < len(things); t++ {
			thing := things[t].(map[string]interface{})
			uid := thing["uid"].(string)
			x := thing["x"].(float64)
			y := thing["y"].(float64)
			z := thing["z"].(float64)
			t := LoadNewThing(me, uid, float32(x)+px, float32(y)+py, float32(z)+pz)
			if uid == "you" {
				me.You = t
			}
		}
	}
}

// Save func
func (me *World) Save(name string) string {
	var data strings.Builder
	data.WriteString("n:")
	data.WriteString(name)
	data.WriteString(",b[")
	for i := 0; i < me.All; i++ {
		block := me.Blocks[i]
		if !block.IsEmpty() {
			block.Save(&data)
			data.WriteString(",")
		}
	}
	data.WriteString("]")
	return data.String()
}

// FindBlock func
func (me *World) FindBlock(x, y, z float32) int {
	gx := int(x)
	gy := int(y)
	gz := int(z)
	bx := int(x * InverseBlockSize)
	by := int(y * InverseBlockSize)
	bz := int(z * InverseBlockSize)
	// TODO
	// bx := int(x) >> BlockShift
	// by := int(y) >> BlockShift
	// bz := int(z) >> BlockShift
	tx := gx - bx*BlockSize
	ty := gy - by*BlockSize
	tz := gz - bz*BlockSize
	block := me.Blocks[bx+by*me.Width+bz*me.Slice]
	return block.Tiles[tx+ty*BlockSize+tz*BlockSlice]
}

// GetTileType func
func (me *World) GetTileType(cx, cy, cz, bx, by, bz int) int {
	for bx < 0 {
		bx += BlockSize
		cx--
	}
	for bx >= BlockSize {
		bx -= BlockSize
		cx++
	}
	for by < 0 {
		by += BlockSize
		cy--
	}
	for by >= BlockSize {
		by -= BlockSize
		cy++
	}
	for bz < 0 {
		bz += BlockSize
		cz--
	}
	for bz >= BlockSize {
		bz -= BlockSize
		cz++
	}
	block := me.GetBlock(cx, cy, cz)
	if block == nil {
		return TileNone
	}
	return block.GetTileTypeUnsafe(bx, by, bz)
}

// GetBlock func
func (me *World) GetBlock(x, y, z int) *Block {
	if x < 0 || x >= me.Width {
		return nil
	}
	if y < 0 || y >= me.Height {
		return nil
	}
	if z < 0 || z >= me.Length {
		return nil
	}
	return me.Blocks[x+y*me.Width+z*me.Slice]
}

// AddThing func
func (me *World) AddThing(t *Thing) {
	if me.ThingCount == len(me.Things) {
		array := make([]*Thing, me.ThingCount+5)
		copy(array, me.Things)
		me.Things = array
	}
	me.Things[me.ThingCount] = t
	me.ThingCount++
}

// RemoveThing func
func (me *World) RemoveThing(t *Thing) {
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

// AddThinker func
func (me *World) AddThinker(t *Think) {
	if me.ThinkCount == len(me.Thinkers) {
		array := make([]*Think, me.ThinkCount+5)
		copy(array, me.Thinkers)
		me.Thinkers = array
	}
	me.Thinkers[me.ThinkCount] = t
	me.ThinkCount++
}

// RemoveThinker func
func (me *World) RemoveThinker(t *Think) {
	for i := 0; i < me.ThinkCount; i++ {
		if me.Thinkers[i] == t {
			for j := i; j < me.ThinkCount-1; j++ {
				me.Thinkers[j] = me.Thinkers[j+1]
			}
			me.ThinkCount--
			return
		}
	}
}

// Update func
func (me *World) Update() {
	me.Snapshot.Reset()
	me.Snapshot.WriteString("t[")
	me.ThreadID = WorldThreads[me.ThreadIndex]
	me.ThreadIndex++
	if me.ThreadIndex == len(WorldThreads) {
		me.ThreadIndex = 0
	}
	for i := 0; i < len(me.People); i++ {
		person := me.People[i]
		person.Think(person, me)
		person.InputCount = 0
	}
	for i := 0; i < me.ThinkCount; i++ {
		think := me.Thinkers[i]
		think.Think(think.Thing, me)
	}
	for i := 0; i < me.ThingCount; i++ {
		me.Things[i].Update(me)
	}
	me.Snapshot.WriteString("]")
}
