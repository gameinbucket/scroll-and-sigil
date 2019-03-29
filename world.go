package main

import (
	"math"
	"strconv"
	"strings"
	"time"
)

// World constants
const (
	WorldTickRate  = 50
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
	Width                           int
	Height                          int
	Length                          int
	Slice                           int
	All                             int
	Blocks                          []*Block
	ThingCount                      int
	ItemCount                       int
	MissileCount                    int
	Things                          []*Thing
	Items                           []*Item
	Missiles                        []*Missile
	ThreadIndex                     int
	ThreadID                        string
	SpawnYouX, SpawnYouY, SpawnYouZ float32 // TODO temp
	broadcast                       strings.Builder
}

// NewWorld func
func NewWorld() *World {
	world := &World{}
	world.broadcast = strings.Builder{}
	return world
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

	me.ThingCount = 0
	me.ItemCount = 0
	me.MissileCount = 0

	me.Things = make([]*Thing, 5)
	me.Items = make([]*Item, 5)
	me.Missiles = make([]*Missile, 5)

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
			LoadNewThing(me, uid, float32(x)+px, float32(y)+py, float32(z)+pz)
		}
	}
}

// NewPlayer func
func (me *World) NewPlayer(person *Person) *You {
	return NewYou(me, person, me.SpawnYouX, me.SpawnYouY, me.SpawnYouZ)
}

// SendBroadcast func
func (me *World) SendBroadcast(snap string) {
	me.broadcast.WriteString(snap)
}

// BuildSnapshots func
func (me *World) BuildSnapshots(people []*Person) {
	// TODO build separate snapshot list for every player and avoid broadcasting what isn't needed
	// hold a map of what things are up-to-date for player, and resend full thing if there is a gap
	// must build snapshot AFTER world update, else what happens if thing state changes after an event within same loop
	num := len(server.people)
	time := strconv.FormatInt(time.Now().UnixNano()/1000000-1552330000000, 10)

	var mapSnap strings.Builder
	mapSnap.Reset()
	mapSnap.WriteString("s:")
	mapSnap.WriteString(time)
	mapSnap.WriteString(",t[")
	numThings := me.ThingCount
	for i := 0; i < numThings; i++ {
		thing := me.Things[i]
		thing.Snap(&mapSnap)

	}
	mapSnap.WriteString("]")
	if me.broadcast.Len() > 0 {
		mapSnap.WriteString(",b[")
		mapSnap.WriteString(me.broadcast.String())
		mapSnap.WriteString("]")
	}
	snap := mapSnap.String()
	me.broadcast.Reset()

	for i := 0; i < num; i++ {
		person := server.people[i]
		personSnap := person.snap
		personSnap.Reset()
		personSnap.WriteString(snap)
	}
}

// Save func
func (me *World) Save(name string, person *Person) string {
	var data strings.Builder
	data.WriteString("n:")
	data.WriteString(name)
	data.WriteString(",p:")
	data.WriteString(person.Character.NID)
	data.WriteString(",b[")
	for i := 0; i < me.All; i++ {
		me.Blocks[i].Save(&data)
		data.WriteString(",")
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
	tx := gx - bx*BlockSize
	ty := gy - by*BlockSize
	tz := gz - bz*BlockSize
	block := me.Blocks[bx+by*me.Width+bz*me.Slice]
	return block.Tiles[tx+ty*BlockSize+tz*BlockSlice]
}

// GetTileType func
func (me *World) GetTileType(bx, by, bz, tx, ty, tz int) int {
	for tx < 0 {
		tx += BlockSize
		bx--
	}
	for tx >= BlockSize {
		tx -= BlockSize
		bx++
	}
	for ty < 0 {
		ty += BlockSize
		by--
	}
	for ty >= BlockSize {
		ty -= BlockSize
		by++
	}
	for tz < 0 {
		tz += BlockSize
		bz--
	}
	for bz >= BlockSize {
		tz -= BlockSize
		bz++
	}
	block := me.GetBlock(bx, by, bz)
	if block == nil {
		return TileNone
	}
	return block.GetTileTypeUnsafe(tx, ty, tz)
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
			me.Things[i] = me.Things[me.ThingCount-1]
			me.ThingCount--
			return
		}
	}
}

// AddItem func
func (me *World) AddItem(t *Item) {
	if me.ItemCount == len(me.Items) {
		array := make([]*Item, me.ItemCount+5)
		copy(array, me.Items)
		me.Items = array
	}
	me.Items[me.ItemCount] = t
	me.ItemCount++
}

// RemoveItem func
func (me *World) RemoveItem(t *Item) {
	for i := 0; i < me.ItemCount; i++ {
		if me.Items[i] == t {
			me.Items[i] = me.Items[me.ItemCount-1]
			me.ItemCount--
			return
		}
	}
}

// AddMissile func
func (me *World) AddMissile(t *Missile) {
	if me.MissileCount == len(me.Missiles) {
		array := make([]*Missile, me.MissileCount+5)
		copy(array, me.Missiles)
		me.Missiles = array
	}
	me.Missiles[me.MissileCount] = t
	me.MissileCount++
}

// Update func
func (me *World) Update() {
	me.ThreadID = WorldThreads[me.ThreadIndex]
	me.ThreadIndex++
	if me.ThreadIndex == len(WorldThreads) {
		me.ThreadIndex = 0
	}
	num := me.ThingCount
	for i := 0; i < num; i++ {
		thing := me.Things[i]
		if thing.Update() {
			me.Things[i] = me.Things[num-1]
			me.Things[num-1] = nil
			me.ThingCount--
			num--
			i--
		}
	}
	num = me.MissileCount
	for i := 0; i < num; i++ {
		missile := me.Missiles[i]
		if missile.Update() {
			me.Missiles[i] = me.Missiles[num-1]
			me.Missiles[num-1] = nil
			me.MissileCount--
			num--
			i--
		}
	}
}
