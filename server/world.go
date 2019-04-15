package main

import (
	"bytes"
	"encoding/binary"
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

// Broadcast constants
const (
	BroadcastNew    = uint8(0)
	BroadcastDelete = uint8(1)
	BroadcastChat   = uint8(2)
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
	SpawnYouX, SpawnYouY, SpawnYouZ float32
	broadcastCount                  uint8
	broadcast                       *bytes.Buffer
}

// NewWorld func
func NewWorld() *World {
	world := &World{}
	world.broadcast = &bytes.Buffer{}
	world.SpawnYouX = 12
	world.SpawnYouY = 12
	world.SpawnYouZ = 12
	return world
}

// Load func
func (me *World) Load(data []byte) {
	content := ParserRead(data)

	width := ParseInt(content["w"].(string))
	height := ParseInt(content["h"].(string))
	length := ParseInt(content["l"].(string))

	blocks := content["b"].(*Array).data
	num := len(blocks)

	things := content["t"].(*Array).data
	items := content["i"].(*Array).data

	me.Width = width
	me.Height = height
	me.Length = length
	me.Slice = width * height
	me.All = me.Slice * length
	me.Blocks = make([]*Block, me.All)

	me.ThingCount = 0
	me.ItemCount = 0
	me.MissileCount = 0

	me.Things = make([]*Thing, 5)
	me.Items = make([]*Item, 5)
	me.Missiles = make([]*Missile, 5)

	bx := 0
	by := 0
	bz := 0
	for b := 0; b < num; b++ {
		bdata := blocks[b].(map[string]interface{})
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

		bx++
		if bx == width {
			bx = 0
			by++
			if by == height {
				by = 0
				bz++
			}
		}
	}

	for t := 0; t < len(things); t++ {
		thing := things[t].(map[string]interface{})
		uid := ParseInt(thing["u"].(string))
		x := ParseFloat(thing["x"].(string))
		y := ParseFloat(thing["y"].(string))
		z := ParseFloat(thing["z"].(string))
		LoadNewThing(me, uint16(uid), x, y, z)
	}

	for t := 0; t < len(items); t++ {
		item := items[t].(map[string]interface{})
		uid := ParseInt(item["u"].(string))
		x := ParseFloat(item["x"].(string))
		y := ParseFloat(item["y"].(string))
		z := ParseFloat(item["z"].(string))
		LoadNewItem(me, uint16(uid), x, y, z)
	}
}

// NewPlayer func
func (me *World) NewPlayer(person *Person) *You {
	return NewYou(me, person, me.SpawnYouX, me.SpawnYouY, me.SpawnYouZ)
}

// Save func
func (me *World) Save(person *Person) []byte {
	raw := &bytes.Buffer{}

	binary.Write(raw, binary.LittleEndian, person.Character.NID)
	binary.Write(raw, binary.LittleEndian, uint16(me.Width))
	binary.Write(raw, binary.LittleEndian, uint16(me.Height))
	binary.Write(raw, binary.LittleEndian, uint16(me.Length))

	for i := 0; i < me.All; i++ {
		me.Blocks[i].Save(raw)
	}

	numThings := me.ThingCount
	binary.Write(raw, binary.LittleEndian, uint16(numThings))
	for i := 0; i < numThings; i++ {
		me.Things[i].Save(raw)
	}

	numItems := me.ItemCount
	binary.Write(raw, binary.LittleEndian, uint16(numItems))
	for i := 0; i < numItems; i++ {
		me.Items[i].Save(raw)
	}

	numMissiles := me.MissileCount
	binary.Write(raw, binary.LittleEndian, uint16(numMissiles))
	for i := 0; i < numMissiles; i++ {
		me.Missiles[i].Snap(raw)
	}

	return raw.Bytes()
}

// BuildSnapshots func
func (me *World) BuildSnapshots(people []*Person) {
	num := len(people)
	time := time.Now().UnixNano()/1000000 - 1552330000000
	numThings := me.ThingCount

	body := &bytes.Buffer{}
	raw := &bytes.Buffer{}

	var broadcast []byte
	broadcasting := me.broadcastCount
	if broadcasting > 0 {
		binary := me.broadcast.Bytes()
		broadcast = make([]byte, len(binary))
		copy(broadcast, binary)
		me.broadcast.Reset()
		me.broadcastCount = 0
	}

	for i := 0; i < numThings; i++ {
		me.Things[i].Snap(body)
	}

	body.Reset()
	spriteSet := make(map[*Thing]bool)
	updatedThings := 0
	for i := 0; i < numThings; i++ {
		thing := me.Things[i]
		if _, has := spriteSet[thing]; !has {
			spriteSet[thing] = true
			if thing.Binary != nil {
				body.Write(thing.Binary)
				updatedThings++
			}
		}
	}

	for i := 0; i < num; i++ {
		person := people[i]

		raw.Reset()
		binary.Write(raw, binary.LittleEndian, uint32(time))

		binary.Write(raw, binary.LittleEndian, broadcasting)
		if broadcasting > 0 {
			raw.Write(broadcast)
		}

		binary.Write(raw, binary.LittleEndian, uint16(updatedThings))
		raw.Write(body.Bytes())

		binary := raw.Bytes()
		person.snap = make([]byte, len(binary))
		copy(person.snap, binary)
	}
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
