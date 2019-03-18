package main

// Missile struct
type Missile struct {
	World               *World
	UID                 string
	NID                 string
	X, Y, Z             float32
	DX, DY, DZ          float32
	MinBX, MinBY, MinBZ int
	MaxBX, MaxBY, MaxBZ int
	Radius              float32
	Height              float32
	GC                  bool
	Damage              int
	HitFunc             func(me *Missile, thing ThingInterface)
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
func (me *Missile) AddToBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				me.World.GetBlock(gx, gy, gz).AddMissile(me)
			}
		}
	}
}

// RemoveFromBlocks func
func (me *Missile) RemoveFromBlocks() {
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				me.World.GetBlock(gx, gy, gz).RemoveMissile(me)
			}
		}
	}
}

// Overlap func
func (me *Missile) Overlap(b *Thing) bool {
	square := me.Radius + b.Radius
	return Abs(me.X-b.X) <= square && Abs(me.Z-b.Z) <= square
}

// Collision func
func (me *Missile) Collision() bool {
	searched := make(map[*Thing]bool)
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				block := me.World.GetBlock(gx, gy, gz)
				for t := 0; t < block.ThingCount; t++ {
					thing := block.Things[t]
					if _, ok := searched[thing]; !ok {
						searched[thing] = true
						if me.Overlap(thing) {
							me.HitFunc(me, thing)
							return true
						}
					}
				}
			}
		}
	}
	minGX := int((me.X - me.Radius))
	minGY := int(me.Y)
	minGZ := int((me.Z - me.Radius))
	maxGX := int((me.X + me.Radius))
	maxGY := int((me.Y + me.Height))
	maxGZ := int((me.Z + me.Radius))
	for gx := minGX; gx <= maxGX; gx++ {
		for gy := minGY; gy <= maxGY; gy++ {
			for gz := minGZ; gz <= maxGZ; gz++ {
				bx := int(float32(gx) * InverseBlockSize)
				by := int(float32(gy) * InverseBlockSize)
				bz := int(float32(gz) * InverseBlockSize)
				tx := gx - bx*BlockSize
				ty := gy - by*BlockSize
				tz := gz - bz*BlockSize
				tile := me.World.GetTileType(bx, by, bz, tx, ty, tz)
				if TileClosed[tile] {
					me.HitFunc(me, nil)
					return true
				}
			}
		}
	}
	return false
}

// Update func
func (me *Missile) Update() {
	if me.Collision() {
		return
	}
	me.X += me.DX
	me.Y += me.DY
	me.Z += me.DZ
	me.Collision()
}

// NewPlasma func
func NewPlasma(world *World, damage int, x, y, z, dx, dy, dz float32) *Missile {
	me := &Missile{}
	me.UID = "plasma"
	me.NID = NextNID()
	me.World = world
	me.X = x
	me.Y = y
	me.Z = z
	me.DX = dx
	me.DY = dy
	me.DZ = dz
	me.Radius = 0.4
	me.Height = 1.0
	me.Damage = damage
	me.HitFunc = PlasmaHit
	world.AddMissile(me)
	me.BlockBorders()
	me.AddToBlocks()
	return me
}

// PlasmaHit func
func PlasmaHit(me *Missile, thing ThingInterface) {
	me.X -= me.DX
	me.Y -= me.DY
	me.Z -= me.DZ
	if thing != nil {
		thing.Damage(1)
	}
	// client impact sound
	NewPlasmaExplosion(me.World, me.X, me.Y, me.Z)
	me.GC = true
}
