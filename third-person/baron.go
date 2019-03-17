package main

import (
	"fmt"
	"math"
)

// AnimationStatus enum
type AnimationStatus int

// AnimationStatus constants
const (
	AnimationNotDone    AnimationStatus = 0
	AnimationAlmostDone AnimationStatus = 1
	AnimationDone       AnimationStatus = 2
)

// BaronStatus enum
type BaronStatus int

// Baron constants
const (
	BaronSleep   BaronStatus = 0
	BaronDead    BaronStatus = 1
	BaronLook    BaronStatus = 2
	BaronChase   BaronStatus = 3
	BaronMelee   BaronStatus = 4
	BaronMissile BaronStatus = 5
)

// Baron struct
type Baron struct {
	*Npc
	Status       BaronStatus
	Reaction     int
	MeleeRange   float32
	MissileRange float32
}

// NewBaron func
func NewBaron(world *World, x, y, z float32) *Baron {
	t := &Baron{}
	t.Npc = &Npc{}
	t.Living = &Living{}
	t.Thing = &Thing{}
	t.UID = "baron"
	t.NID = NextNID()
	t.X = x
	t.Y = y
	t.Z = z
	t.Radius = 0.4
	t.Height = 1.0
	t.SpriteName = "idle"
	t.Health = 1
	t.Speed = 0.1
	t.MoveDirection = DirectionNone
	t.Status = BaronLook
	t.Npc.Me = t
	t.Living.Me = t.Npc
	t.Thing.Me = t.Living
	t.MeleeRange = 0.9
	t.MissileRange = 10.1
	world.AddThing(t)
	t.BlockBorders()
	t.AddToBlocks(world)
	return t
}

// MeleeAttack func
func (me *Baron) MeleeAttack() {
	if me.ApproximateDistance(me.Target.Thing) <= me.MeleeRange {
		me.Target.Damage(1 + NextRandP()%3)
	}
}

// ThrowMissile func
func (me *Baron) ThrowMissile() {
	const speed = 0.3
	angle := math.Atan2(float64(me.Target.Z-me.Z), float64(me.Target.X-me.X))
	dx := math.Cos(angle)
	dz := math.Sin(angle)
	dist := me.ApproximateDistance(me.Target.Thing)
	dy := (me.Target.Y + me.Target.Height*0.5 - me.Y - me.Height*0.5) / (dist / speed)
	fmt.Println(dx, dy, dz)
}

// Dead func
func (me *Baron) Dead() {
	if me.AnimationFrame < len(me.Animation)-1 {
		me.UpdateAnimation()
	}
}

// Look func
func (me *Baron) Look(world *World) {
	for i := 0; i < world.ThingCount; i++ {
		t := world.Things[i]
		if me == t {
			continue
		}
		thing := t.Cast()
		if thing.Me != nil {
			living := thing.Me.(*Living)
			if living != nil {
				if living.Health > 0 {
					me.Target = living
					me.Status = BaronChase
					return
				}
			}
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
		me.MeleeAttack()
	} else if anim == AnimationDone {
		me.AnimationFrame = 0
		me.Status = BaronChase
		me.Animation = me.Animations["walk"]
	}
}

// Missile func
func (me *Baron) Missile() {
	anim := me.UpdateAnimation()
	if anim == AnimationAlmostDone {
		me.Reaction = 40 + NextRandP()%220
		me.ThrowMissile()
	} else if anim == AnimationDone {
		me.AnimationFrame = 0
		me.Status = BaronChase
		me.Animation = me.Animations["walk"]
	}
}

// Chase func
func (me *Baron) Chase(world *World) {
	if me.Reaction > 0 {
		me.Reaction--
	}
	if me.Target == nil || me.Target.Health <= 0 {
		me.Target = nil
		me.Status = BaronLook
	} else {
		dist := me.ApproximateDistance(me.Target.Thing)
		if me.Reaction == 0 && dist < me.MeleeRange {
			me.Status = BaronMelee
			me.AnimationMod = 0
			me.AnimationFrame = 0
			me.Animation = me.Animations["melee"]
		} else if me.Reaction == 0 && dist <= me.MissileRange {
			me.Status = BaronMissile
			me.AnimationMod = 0
			me.AnimationFrame = 0
			me.Animation = me.Animations["missile"]
		} else {
			me.MoveCount--
			if me.MoveCount < 0 || !me.Move(world) {
				me.NewDirection(world)
			}
			if me.UpdateAnimation() == AnimationDone {
				me.AnimationFrame = 0
			}
		}
	}
}

// Update func
func (me *Baron) Update(world *World) {
	switch me.Status {
	case BaronDead:
		me.Dead()
	case BaronLook:
		me.Look(world)
	case BaronMelee:
		me.Melee()
	case BaronMissile:
		me.Missile()
	case BaronChase:
		me.Chase(world)
	}
	me.Integrate(world)
}

// UpdateAnimation func
func (me *Baron) UpdateAnimation() AnimationStatus {
	me.AnimationMod++
	if me.AnimationMod == AnimationRate {
		me.AnimationMod = 0
		me.AnimationFrame++
		if me.AnimationFrame == len(me.Animation)-1 {
			return AnimationAlmostDone
		} else if me.AnimationFrame == len(me.Animation) {
			return AnimationDone
		}
	}
	return AnimationNotDone
}
