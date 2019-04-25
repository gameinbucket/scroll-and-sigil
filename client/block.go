package main

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

// NotEmpty func
func (me *Block) NotEmpty() uint8 {
	for i := 0; i < BlockAll; i++ {
		if me.Tiles[i] != TileNone {
			return 1
		}
	}
	return 0
}

// GetTileTypeUnsafe func
func (me *Block) GetTileTypeUnsafe(x, y, z int) int {
	return me.Tiles[x+y*BlockSize+z*BlockSlice]
}

// AddThing func
func (me *Block) AddThing(t *Thing) {
}

// RemoveThing func
func (me *Block) RemoveThing(t *Thing) {
}

// AddItem func
func (me *Block) AddItem(t *Item) {
}

// RemoveItem func
func (me *Block) RemoveItem(t *Item) {
}

// AddMissile func
func (me *Block) AddMissile(t *Missile) {
}

// RemoveMissile func
func (me *Block) RemoveMissile(t *Missile) {
}

// AddLight func
func (me *Block) AddLight(t *Light) {
}

// RemoveLight func
func (me *Block) RemoveLight(t *Light) {
}
