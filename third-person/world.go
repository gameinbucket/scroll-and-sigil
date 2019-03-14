package main

import (
	"math"
	"strconv"
	"strings"
	"time"
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
	Things      []ThingInterface
	ThingCount  int
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
	content := ParserRead(data)

	blocks := content["b"].(*Array).data
	left := math.MaxInt32
	right := math.MinInt32
	top := math.MinInt32
	bottom := math.MaxInt32
	front := math.MinInt32
	back := math.MaxInt32

	for b := 0; b < len(blocks); b++ {
		block := blocks[b].(map[string]interface{})
		bx := ParseInt(block["x"].(string))
		by := ParseInt(block["y"].(string))
		bz := ParseInt(block["z"].(string))

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
	me.Blocks = make([]*Block, me.All)

	for b := 0; b < len(blocks); b++ {
		bdata := blocks[b].(map[string]interface{})
		bx := ParseInt(bdata["x"].(string)) - left
		by := ParseInt(bdata["y"].(string)) - bottom
		bz := ParseInt(bdata["z"].(string)) - back
		tiles := bdata["t"].(*Array).data
		lights := bdata["c"].(*Array).data

		block := NewBlock(bx, by, bz)
		if len(tiles) > 0 {
			for t := 0; t < BlockAll; t++ {
				block.Tiles[t] = ParseInt(tiles[t].(string))
			}
		}

		for t := 0; t < len(lights); t++ {
			light := lights[t].(map[string]interface{})
			x := ParseInt(light["x"].(string))
			y := ParseInt(light["y"].(string))
			z := ParseInt(light["z"].(string))
			rgb := ParseInt(light["v"].(string))
			block.AddLight(NewLight(x, y, z, rgb))
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
	me.Things = make([]ThingInterface, 5)
	me.ThingCount = 0

	for b := 0; b < len(blocks); b++ {
		bdata := blocks[b].(map[string]interface{})
		bx := ParseInt(bdata["x"].(string)) - left
		by := ParseInt(bdata["y"].(string)) - bottom
		bz := ParseInt(bdata["z"].(string)) - back
		things := bdata["e"].(*Array).data

		px := float32(bx * BlockSize)
		py := float32(by * BlockSize)
		pz := float32(bz * BlockSize)

		for t := 0; t < len(things); t++ {
			thing := things[t].(map[string]interface{})
			uid := thing["u"].(string)
			x := ParseFloat(thing["x"].(string))
			y := ParseFloat(thing["y"].(string))
			z := ParseFloat(thing["z"].(string))
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
func (me *World) AddThing(t ThingInterface) {
	if me.ThingCount == len(me.Things) {
		array := make([]ThingInterface, me.ThingCount+5)
		copy(array, me.Things)
		me.Things = array
	}
	me.Things[me.ThingCount] = t
	me.ThingCount++
}

// RemoveThing func
func (me *World) RemoveThing(t ThingInterface) {
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

// Update func
func (me *World) Update() {
	me.Snapshot.Reset()
	me.Snapshot.WriteString("s:")
	me.Snapshot.WriteString(strconv.FormatInt(time.Now().UnixNano()/1000000-1552330000000, 10))
	me.Snapshot.WriteString(",t[")
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
	for i := 0; i < me.ThingCount; i++ {
		me.Things[i].Update(me)
	}
	me.Snapshot.WriteString("]")
}
