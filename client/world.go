package main

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
}

// Load func
func (me *World) Load(data []byte) {
}

// AddThing func
func (me *World) AddThing(t *Thing) {
}

// RemoveThing func
func (me *World) RemoveThing(t *Thing) {
}

// AddItem func
func (me *World) AddItem(t *Item) {
}

// RemoveItem func
func (me *World) RemoveItem(t *Item) {
}

// AddMissile func
func (me *World) AddMissile(t *Missile) {
}

// Update func
func (me *World) Update() {
}
