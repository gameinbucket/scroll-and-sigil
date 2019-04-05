package main

import (
	"bytes"
	"encoding/binary"
	"math"
	"strconv"
	"strings"
)

// Animation constants
const (
	HumanWalkAnimation    int = 2 * AnimationRate
	HumanMeleeAnimation   int = 2 * AnimationRate
	HumanMissileAnimation int = 3 * AnimationRate
	HumanDeathAnimation   int = 2 * AnimationRate
)

// Human constants
const (
	HumanDead    = 0
	HumanIdle    = 1
	HumanWalk    = 2
	HumanMelee   = 3
	HumanMissile = 4
)

// Input constants
const (
	InputOpNewMove      = uint8(0)
	InputOpContinueMove = uint8(1)
	InputOpMissile      = uint8(2)
)

// You struct
type You struct {
	*Thing
	Status      int
	DeltaAngle  bool
	DeltaHealth bool
	DeltaStatus bool
	Person      *Person
}

// NewYou func
func NewYou(world *World, person *Person, x, y, z float32) *You {
	you := &You{}
	you.Thing = &Thing{}
	you.UID = HumanUID
	you.NID = NextNID()
	you.World = world
	you.Thing.Update = you.Update
	you.Thing.Damage = you.Damage
	you.Thing.Save = you.Save
	you.Thing.BinarySave = you.BinarySave
	you.Thing.Snap = you.Snap
	you.X = x
	you.Y = y
	you.Z = z
	you.Radius = 0.4
	you.Height = 1.0
	you.Speed = 0.1
	you.Health = 8
	you.Group = HumanGroup
	you.Status = HumanIdle
	you.Person = person
	world.AddThing(you.Thing)
	you.BlockBorders()
	you.AddToBlocks()
	return you
}

// Save func
func (me *You) Save(snap *strings.Builder) {
	snap.WriteString("{u:")
	snap.WriteString(strconv.Itoa(int(me.UID)))
	snap.WriteString(",n:")
	snap.WriteString(strconv.Itoa(int(me.NID)))
	snap.WriteString(",x:")
	snap.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	snap.WriteString(",y:")
	snap.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	snap.WriteString(",z:")
	snap.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	snap.WriteString(",a:")
	snap.WriteString(strconv.FormatFloat(float64(me.Angle), 'f', -1, 32))
	snap.WriteString(",h:")
	snap.WriteString(strconv.Itoa(me.Health))
	snap.WriteString("}")
}

// BinarySave func
func (me *You) BinarySave(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, me.UID)
	binary.Write(raw, binary.LittleEndian, me.NID)
	binary.Write(raw, binary.LittleEndian, float32(me.X))
	binary.Write(raw, binary.LittleEndian, float32(me.Y))
	binary.Write(raw, binary.LittleEndian, float32(me.Z))
	binary.Write(raw, binary.LittleEndian, float32(me.Angle))
	binary.Write(raw, binary.LittleEndian, uint16(me.Health))
	binary.Write(raw, binary.LittleEndian, uint8(me.Status))
}

// Snap func
func (me *You) Snap(raw *bytes.Buffer) int {
	delta := uint8(0)
	if me.DeltaMoveXZ {
		delta |= 0x1
	}
	if me.DeltaMoveY {
		delta |= 0x2
	}
	if me.DeltaHealth {
		delta |= 0x4
	}
	if me.DeltaStatus {
		delta |= 0x8
	}
	if me.DeltaAngle {
		delta |= 0x10
	}
	if delta == 0 {
		return 0
	}
	binary.Write(raw, binary.LittleEndian, me.NID)
	binary.Write(raw, binary.LittleEndian, delta)
	if me.DeltaMoveXZ {
		binary.Write(raw, binary.LittleEndian, float32(me.X))
		binary.Write(raw, binary.LittleEndian, float32(me.Z))
		me.DeltaMoveXZ = false
	}
	if me.DeltaMoveY {
		binary.Write(raw, binary.LittleEndian, float32(me.Y))
		me.DeltaMoveY = false
	}
	if me.DeltaHealth {
		binary.Write(raw, binary.LittleEndian, uint16(me.Health))
		me.DeltaHealth = false
	}
	if me.DeltaStatus {
		binary.Write(raw, binary.LittleEndian, uint8(me.Status))
		me.DeltaStatus = false
	}
	if me.DeltaAngle {
		binary.Write(raw, binary.LittleEndian, float32(me.Angle))
		me.DeltaAngle = false
	}
	return 1
}

// Damage func
func (me *You) Damage(amount int) {
	if me.Status == HumanDead {
		return
	}
	me.Health -= amount
	me.DeltaHealth = true
	if me.Health < 1 {
		me.Health = 0
		me.Status = HumanDead
		me.DeltaStatus = true
		me.AnimationFrame = 0
		me.Animation = HumanDeathAnimation
		me.RemoveFromBlocks()
	}
}

// Dead func
func (me *You) Dead() {
	if me.AnimationFrame == me.Animation-1 {
		me.Thing.Update = me.NopUpdate
		me.Thing.Snap = me.NopSnap
	} else {
		me.UpdateAnimation()
	}
}

// Missile func
func (me *You) Missile() {
	anim := me.UpdateAnimation()
	if anim == AnimationAlmostDone {
		const speed = 0.5
		angle := float64(me.Angle)
		dx := float32(math.Sin(angle))
		dz := -float32(math.Cos(angle))
		x := me.X + dx*me.Radius*3.0
		y := me.Y + me.Height*0.75
		z := me.Z + dz*me.Radius*3.0
		NewPlasma(me.World, 1+NextRandP()%3, x, y, z, dx*speed, 0.0, dz*speed)
	} else if anim == AnimationDone {
		me.Status = HumanIdle
		me.DeltaStatus = true
	}
}

// Walk func
func (me *You) Walk() {
	person := me.Person
	if person.InputCount == 0 {
		return
	}
	move := false
	attack := false
gotoRead:
	for i := 0; i < person.InputCount; i++ {
		input := person.InputQueue[i]
		reader := bytes.NewReader(input)
		var opCount uint8
		err := binary.Read(reader, binary.LittleEndian, &opCount)
		if err != nil {
			break gotoRead
		}
		for c := uint8(0); c < opCount; c++ {
			var opUint8 uint8
			err = binary.Read(reader, binary.LittleEndian, &opUint8)
			if err != nil {
				break gotoRead
			}
			if opUint8 == InputOpMissile {
				attack = true
			} else if opUint8 == InputOpContinueMove {
				move = true
			} else if opUint8 == InputOpNewMove {
				var opFloat32 float32
				err = binary.Read(reader, binary.LittleEndian, &opFloat32)
				if err != nil {
					break gotoRead
				}
				me.Angle = opFloat32
				me.DeltaAngle = true
				move = true
			}
		}
	}
	person.InputCount = 0

	if attack {
		me.Status = HumanMissile
		me.DeltaStatus = true
		me.AnimationFrame = 0
		me.Animation = HumanMissileAnimation
	} else if move {
		me.DeltaX += float32(math.Sin(float64(me.Angle))) * me.Speed
		me.DeltaZ -= float32(math.Cos(float64(me.Angle))) * me.Speed
		me.IntegrateXZ()
		if me.Status == HumanIdle {
			me.Status = HumanWalk
			me.DeltaStatus = true
		}
	} else if me.Status == HumanWalk {
		me.Status = HumanIdle
		me.DeltaStatus = true
	}
}

// Update func
func (me *You) Update() bool {
	switch me.Status {
	case HumanDead:
		me.Dead()
	case HumanMissile:
		me.Missile()
	default:
		me.Walk()
	}
	me.IntegrateY()
	return false
}
