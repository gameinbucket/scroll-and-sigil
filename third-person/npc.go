package main

// Direction enum
type Direction int

// Npc constants
const (
	DirectionNorth     Direction = 0
	DirectionNorthEast Direction = 1
	DirectionEast      Direction = 2
	DirectionSouthEast Direction = 3
	DirectionSouth     Direction = 4
	DirectionSouthWest Direction = 5
	DirectionWest      Direction = 6
	DirectionNorthWest Direction = 7
	DirectionCount               = 8
	DirectionNone      Direction = 8
)

// Npc variables
var (
	Directions = []Direction{
		DirectionNorth,
		DirectionNorthEast,
		DirectionEast,
		DirectionSouthEast,
		DirectionSouth,
		DirectionSouthWest,
		DirectionWest,
		DirectionNorthWest,
	}
	OppositeDirection = []Direction{
		DirectionSouth,
		DirectionSouthWest,
		DirectionWest,
		DirectionNorthWest,
		DirectionNorth,
		DirectionNorthEast,
		DirectionEast,
		DirectionSouthEast,
		DirectionNone,
	}
	DiagonalDirection = []Direction{
		DirectionSouthEast,
		DirectionSouthWest,
		DirectionNorthEast,
		DirectionNorthWest,
	}
	NpcMoveX = []float32{
		0.0, -0.5, -1.0, -0.5, 0.0, 0.5, 1.0, 0.5,
	}
	NpcMoveZ = []float32{
		1.0, 0.5, 0.0, -0.5, -1.0, -0.5, 0.0, 0.5,
	}
)

// Npc struct
type Npc struct {
	*Living
	Me            interface{}
	Target        *Living
	MoveCount     int
	MoveDirection Direction
}

// NewDirection func
func (me *Npc) NewDirection(world *World) {
	const epsilon = 0.32
	dx := me.Target.X - me.X
	dz := me.Target.X - me.Z
	old := me.MoveDirection
	opposite := OppositeDirection[old]

	var directionX Direction
	if dx > epsilon {
		directionX = DirectionWest
	} else if dx < -epsilon {
		directionX = DirectionEast
	} else {
		directionX = DirectionNone
	}

	var directionZ Direction
	if dz > epsilon {
		directionZ = DirectionNorth
	} else if dz < -epsilon {
		directionZ = DirectionSouth
	} else {
		directionZ = DirectionNone
	}

	if directionX != DirectionNone && directionZ != DirectionNone {
		d := 0
		if dz > 0 {
			d += 2
		}
		if dx > 0 {
			d++
		}
		me.MoveDirection = DiagonalDirection[d]
		if me.MoveDirection != opposite && me.TestMove(world) {
			return
		}
	}

	if NextRandP() > 200 || Abs(dz) > Abs(dx) {
		temp := directionX
		directionX = directionZ
		directionZ = temp
	}

	if directionX != opposite {
		me.MoveDirection = directionX
		if me.TestMove(world) {
			return
		}
	} else {
		directionX = DirectionNone
	}

	if directionZ != opposite {
		me.MoveDirection = directionZ
		if me.TestMove(world) {
			return
		}
	} else {
		directionZ = DirectionNone
	}

	if old != DirectionNone {
		me.MoveDirection = old
		if me.TestMove(world) {
			return
		}
	}

	if NextRandP()&1 > 0 {
		for i := 0; i < DirectionCount; i++ {
			d := Directions[i]
			if d == opposite {
				continue
			}
			me.MoveDirection = d
			if me.TestMove(world) {
				return
			}
		}
	} else {
		for i := DirectionCount - 1; i >= 0; i-- {
			d := Directions[i]
			if d == opposite {
				continue
			}
			me.MoveDirection = d
			if me.TestMove(world) {
				return
			}
		}
	}

	if opposite != DirectionNone {
		me.MoveDirection = opposite
		if me.TestMove(world) {
			return
		}
	}

	me.MoveDirection = DirectionNone
}

// TestMove func
func (me *Npc) TestMove(world *World) bool {
	if !me.Move(world) {
		return false
	}
	me.MoveCount = 16 + NextRandP()&32
	return true
}

// TryMove func
func (me *Npc) TryMove(world *World, x, z float32) bool {
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
				tile := world.GetTileType(bx, by, bz, tx, ty, tz)
				if TileClosed[tile] {
					return false
				}
			}
		}
	}
	searched := make(map[*Thing]bool)
	for gx := me.MinBX; gx <= me.MaxBX; gx++ {
		for gy := me.MinBY; gy <= me.MaxBY; gy++ {
			for gz := me.MinBZ; gz <= me.MaxBZ; gz++ {
				block := world.GetBlock(gx, gy, gz)
				for t := 0; t < block.ThingCount; t++ {
					thing := block.Things[t]
					if me.Thing == thing {
						continue
					}
					if _, ok := searched[thing]; !ok {
						searched[thing] = true
						if me.Overlap(thing) {
							return false
						}
					}
				}
			}
		}
	}
	return true
}

// Move func
func (me *Npc) Move(world *World) bool {
	if me.MoveDirection == DirectionNone {
		return true
	}
	tryX := me.X + NpcMoveX[me.MoveDirection]*me.Speed
	tryZ := me.Z + NpcMoveZ[me.MoveDirection]*me.Speed
	if me.TryMove(world, tryX, tryZ) {
		me.RemoveFromBlocks(world)
		me.X = tryX
		me.Z = tryZ
		me.BlockBorders()
		me.AddToBlocks(world)
		return true
	}
	return false
}
