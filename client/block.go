package main

// Constants
const (
	BlockSize        = 8
	InverseBlockSize = 1.0 / BlockSize
	BlockSlice       = BlockSize * BlockSize
	BlockAll         = BlockSlice * BlockSize
)

type block struct {
	x             int
	y             int
	z             int
	mesh          []byte
	visibility    [36]uint8
	beginSide     [6]int
	countSide     [6]int
	thingCount    int
	itemCount     int
	missileCount  int
	particleCount int
	lightCount    int
	things        []*thing
	items         []*item
	missiles      []*missile
	particles     []*particle
	lights        []*light
	tiles         [BlockAll]*tile
}

func blockInit(x, y, z int) *block {
	b := &block{}
	b.x = x
	b.y = y
	b.z = z
	for t := 0; t < BlockAll; t++ {
		b.tiles[t] = &tile{}
	}
	return b
}

// NotEmpty func
func (me *block) NotEmpty() uint8 {
	for i := 0; i < BlockAll; i++ {
		if me.tiles[i].typeOf != TileNone {
			return 1
		}
	}
	return 0
}

// GetTileTypeUnsafe func
func (me *block) GetTileTypeUnsafe(x, y, z int) int {
	return me.tiles[x+y*BlockSize+z*BlockSlice].typeOf
}

// AddThing func
func (me *block) AddThing(t *Thing) {
}

// RemoveThing func
func (me *block) RemoveThing(t *Thing) {
}

// AddItem func
func (me *block) AddItem(t *Item) {
}

// RemoveItem func
func (me *block) RemoveItem(t *Item) {
}

// AddMissile func
func (me *block) AddMissile(t *Missile) {
}

// RemoveMissile func
func (me *block) RemoveMissile(t *Missile) {
}

func (me *block) addLight(t *light) {
}

func (me *block) removeLight(t *light) {
}
