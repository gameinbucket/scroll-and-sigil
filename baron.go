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
	BaronWalkAnimation    int = 2 * AnimationRate
	BaronMeleeAnimation   int = 2 * AnimationRate
	BaronMissileAnimation int = 3 * AnimationRate
	BaronDeathAnimation   int = 2 * AnimationRate
)

// Baron constants
const (
	BaronSleep   = 0
	BaronDead    = 1
	BaronLook    = 2
	BaronChase   = 3
	BaronMelee   = 4
	BaronMissile = 5
)

// Baron struct
type Baron struct {
	*Npc
	Status       int
	Reaction     int
	MeleeRange   float32
	MissileRange float32
	DeltaHealth  bool
	DeltaStatus  bool
}

// NewBaron func
func NewBaron(world *World, x, y, z float32) *Baron {
	baron := &Baron{}
	baron.Npc = &Npc{}
	baron.Thing = &Thing{}
	baron.UID = BaronUID
	baron.NID = NextNID()
	baron.World = world
	baron.Thing.Update = baron.Update
	baron.Thing.Damage = baron.Damage
	baron.Thing.Save = baron.Save
	baron.Thing.BinarySave = baron.BinarySave
	baron.Thing.Snap = baron.Snap
	baron.X = x
	baron.Y = y
	baron.Z = z
	baron.Radius = 0.4
	baron.Height = 1.0
	baron.Animation = BaronWalkAnimation
	baron.Health = 1
	baron.Group = DemonGroup
	baron.Speed = 0.1
	baron.MoveDirection = DirectionNone
	baron.Status = BaronLook
	baron.MeleeRange = 2.0
	baron.MissileRange = 10.0
	world.AddThing(baron.Thing)
	baron.BlockBorders()
	baron.AddToBlocks()
	return baron
}

// Save func
func (me *Baron) Save(snap *strings.Builder) {
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
	snap.WriteString(",d:")
	snap.WriteString(strconv.Itoa(me.MoveDirection))
	snap.WriteString(",s:")
	snap.WriteString(strconv.Itoa(me.Status))
	snap.WriteString(",h:")
	snap.WriteString(strconv.Itoa(me.Health))
	snap.WriteString("},")
}

// BinarySave func
func (me *Baron) BinarySave(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, me.UID)
	binary.Write(raw, binary.LittleEndian, me.NID)
	binary.Write(raw, binary.LittleEndian, float32(me.X))
	binary.Write(raw, binary.LittleEndian, float32(me.Y))
	binary.Write(raw, binary.LittleEndian, float32(me.Z))
	binary.Write(raw, binary.LittleEndian, uint8(me.MoveDirection))
	binary.Write(raw, binary.LittleEndian, uint16(me.Health))
	binary.Write(raw, binary.LittleEndian, uint8(me.Status))
}

// Snap func
func (me *Baron) Snap(raw *bytes.Buffer) int {
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
	if me.DeltaMoveDirection {
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
	if me.DeltaMoveDirection {
		binary.Write(raw, binary.LittleEndian, uint8(me.MoveDirection))
		me.DeltaMoveDirection = false
	}
	return 1
}

// Damage func
func (me *Baron) Damage(amount int) {
	if me.Status == BaronDead {
		return
	}
	me.Health -= amount
	me.DeltaHealth = true
	if me.Health < 1 {
		me.Health = 0
		me.Status = BaronDead
		me.DeltaStatus = true
		me.AnimationFrame = 0
		me.Animation = BaronDeathAnimation
		me.RemoveFromBlocks()
	}
}

// Dead func
func (me *Baron) Dead() {
	if me.AnimationFrame == me.Animation-1 {
		me.Thing.Update = me.NopUpdate
		me.Thing.Snap = me.NopSnap
	} else {
		me.UpdateAnimation()
	}
}

// Look func
func (me *Baron) Look() {
	for i := 0; i < me.World.ThingCount; i++ {
		thing := me.World.Things[i]
		if thing.Group == HumanGroup && thing.Health > 0 {
			me.Target = thing
			me.Status = BaronChase
			me.DeltaStatus = true
			return
		}
	}
	if me.UpdateAnimation() == AnimationDone {
		me.AnimationFrame = 0
	}
}

// Melee func
func (me *Baron) Melee() {
	anim := me.UpdateAnimation()
	if anim == AnimationAlmostDone {
		me.Reaction = 40 + NextRandP()%220
		if me.ApproximateDistance(me.Target) <= me.MeleeRange {
			me.Target.Damage(1 + NextRandP()%3)
		}
	} else if anim == AnimationDone {
		me.Status = BaronChase
		me.DeltaStatus = true
		me.AnimationFrame = 0
		me.Animation = BaronWalkAnimation
	}
}

// Missile func
func (me *Baron) Missile() {
	anim := me.UpdateAnimation()
	if anim == AnimationAlmostDone {
		me.Reaction = 40 + NextRandP()%220
		const speed = 0.3
		angle := math.Atan2(float64(me.Target.Z-me.Z), float64(me.Target.X-me.X))
		dx := float32(math.Cos(angle))
		dz := float32(math.Sin(angle))
		dist := me.ApproximateDistance(me.Target)
		dy := (me.Target.Y + me.Target.Height*0.5 - me.Y - me.Height*0.5) / (dist / speed)
		x := me.X + dx*me.Radius*3.0
		y := me.Y + me.Height*0.75
		z := me.Z + dz*me.Radius*3.0
		NewPlasma(me.World, 1+NextRandP()%3, x, y, z, dx*speed, dy, dz*speed)
	} else if anim == AnimationDone {
		me.Status = BaronChase
		me.DeltaStatus = true
		me.AnimationFrame = 0
		me.Animation = BaronWalkAnimation
	}
}

// Chase func
func (me *Baron) Chase() {
	if me.Reaction > 0 {
		me.Reaction--
	}
	if me.Target == nil || me.Target.Health <= 0 {
		me.Target = nil
		me.DeltaStatus = true
		me.Status = BaronLook
	} else {
		dist := me.ApproximateDistance(me.Target)
		if me.Reaction == 0 && dist < me.MeleeRange {
			me.Status = BaronMelee
			me.DeltaStatus = true
			me.AnimationFrame = 0
			me.Animation = BaronMeleeAnimation
		} else if me.Reaction == 0 && dist <= me.MissileRange {
			me.Status = BaronMissile
			me.DeltaStatus = true
			me.AnimationFrame = 0
			me.Animation = BaronMissileAnimation
		} else {
			me.MoveCount--
			move := me.Move()
			// fmt.Println(strconv.FormatInt(time.Now().UnixNano()/1000000, 10), "b>", move, "none?", me.MoveDirection == DirectionNone)
			if me.MoveCount < 0 || !move {
				me.NewDirection()
			}
			if me.UpdateAnimation() == AnimationDone {
				me.AnimationFrame = 0
			}
		}
	}
}

// Update func
func (me *Baron) Update() bool {
	switch me.Status {
	case BaronDead:
		me.Dead()
	case BaronLook:
		me.Look()
	case BaronMelee:
		me.Melee()
	case BaronMissile:
		me.Missile()
	case BaronChase:
		me.Chase()
	}
	me.IntegrateY()
	return false
}
