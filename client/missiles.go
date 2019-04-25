package main

// Missile struct
type Missile struct {
	World                  *World
	UID                    uint16
	NID                    uint16
	X, Y, Z                float32
	DeltaX, DeltaY, DeltaZ float32
	MinBX, MinBY, MinBZ    int
	MaxBX, MaxBY, MaxBZ    int
	Radius                 float32
	Height                 float32
	DamageAmount           int
	Hit                    func(thing *Thing)
}

// BlockBorders func
func (me *Missile) BlockBorders() {
	me.MinBX = int((me.X - me.Radius) * InverseBlockSize)
	me.MinBY = int(me.Y * InverseBlockSize)
	me.MinBZ = int((me.Z - me.Radius) * InverseBlockSize)
	me.MaxBX = int((me.X + me.Radius) * InverseBlockSize)
	me.MaxBY = int((me.Y + me.Height) * InverseBlockSize)
	me.MaxBZ = int((me.Z + me.Radius) * InverseBlockSize)
}

// AddToBlocks func
func (me *Missile) AddToBlocks() bool {
	return false
}

// RemoveFromBlocks func
func (me *Missile) RemoveFromBlocks() {
}

// Overlap func
func (me *Missile) Overlap(b *Thing) bool {
	square := me.Radius + b.Radius
	return Abs(me.X-b.X) <= square && Abs(me.Z-b.Z) <= square
}

// Collision func
func (me *Missile) Collision() bool {
	return false
}

// Update func
func (me *Missile) Update() bool {
	if me.Collision() {
		return true
	}
	me.RemoveFromBlocks()
	me.X += me.DeltaX
	me.Y += me.DeltaY
	me.Z += me.DeltaZ
	me.BlockBorders()
	if me.AddToBlocks() {
		return true
	}
	return me.Collision()
}

// NewPlasma func
func NewPlasma(world *World, damage int, x, y, z, dx, dy, dz float32) {
	me := &Missile{}
	me.World = world
	me.X = x
	me.Y = y
	me.Z = z
	me.Radius = 0.2
	me.Height = 0.2
	me.BlockBorders()
	if me.AddToBlocks() {
		return
	}
	me.UID = PlasmaUID
	me.NID = NextNID()
	me.DeltaX = dx
	me.DeltaY = dy
	me.DeltaZ = dz
	me.DamageAmount = damage
	me.Hit = me.PlasmaHit

	world.AddMissile(me)
}

// PlasmaHit func
func (me *Missile) PlasmaHit(thing *Thing) {
	me.X -= me.DeltaX
	me.Y -= me.DeltaY
	me.Z -= me.DeltaZ
	if thing != nil {
		thing.Damage(me.DamageAmount)
	}
	me.RemoveFromBlocks()
}
