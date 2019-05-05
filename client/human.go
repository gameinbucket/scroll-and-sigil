package main

import (
	"bytes"
	"encoding/binary"
	"math"
	"math/rand"
	"strconv"

	"./render"
)

const (
	humanDead    = uint8(0)
	humanIdle    = uint8(1)
	humanWalk    = uint8(2)
	humanMelee   = uint8(3)
	humanMissile = uint8(4)
)

var (
	humanAnimationIdle    [][]*render.Sprite
	humanAnimationWalk    [][]*render.Sprite
	humanAnimationMelee   [][]*render.Sprite
	humanAnimationMissile [][]*render.Sprite
	humanAnimationDeath   [][]*render.Sprite
)

type human struct {
	*thing
	status uint8
}

func humanInit(world *world, nid uint16, x, y, z, angle float32, health uint16, status uint8) *human {
	human := &human{}
	human.thing = &thing{}
	human.thing.update = human.updateFn
	human.world = world
	human.uid = HumanUID
	human.sid = "baron"
	human.nid = nid
	human.animation = humanAnimationWalk
	human.x = x
	human.y = y
	human.z = z
	human.angle = angle
	human.oldX = x
	human.oldY = y
	human.oldZ = z
	human.radius = 0.4
	human.height = 1.0
	human.speed = 0.1
	human.health = health
	human.status = status
	world.addThing(human.thing)
	world.netLookup[human.nid] = human
	human.blockBorders()
	human.addToBlocks()
	return human
}

func (me *human) netUpdate(dat *bytes.Reader, delta uint8) {
	me.thingNetUpdate(dat, delta)
	if delta&0x4 != 0 {
		var health uint16
		binary.Read(dat, binary.LittleEndian, &health)
		me.netUpdateHealth(health)
	}
	if delta&0x8 != 0 {
		var state uint8
		binary.Read(dat, binary.LittleEndian, &state)
		me.netUpdateState(state)
	}
	if delta&0x10 != 0 {
		var angle float32
		binary.Read(dat, binary.LittleEndian, &angle)
		me.angle = angle
	}
}

func (me *human) netUpdateState(status uint8) {
	if me.status == status {
		return
	}
	me.animationMod = 0
	me.animationFrame = 0
	switch status {
	case humanDead:
		me.animation = humanAnimationDeath
	case humanMissile:
		me.animation = humanAnimationMissile
		wadSounds["baron-melee"].Call("play")
	case humanIdle:
		me.animation = humanAnimationIdle
	default:
		me.animation = humanAnimationWalk
	}
	me.status = status
}

func (me *human) netUpdateHealth(health uint16) {
	if health < me.health {
		if health < 1 {
			wadSounds["baron-death"].Call("play")
		} else {
			wadSounds["baron-pain"].Call("play")
		}
		for i := 0; i < 20; i++ {
			spriteName := "blood-" + strconv.Itoa(int(math.Floor(rand.Float64()*3)))
			x := me.x + me.radius*(1-rand.Float32()*2)
			y := me.y + me.height*rand.Float32()
			z := me.z + me.radius*(1-rand.Float32()*2)
			const spread = 0.2
			dx := spread * (1 - rand.Float32()*2)
			dy := spread * rand.Float32()
			dz := spread * (1 - rand.Float32()*2)
			bloodInit(me.world, x, y, z, dx, dy, dz, spriteName)
		}

	}
	me.health = health
}

func (me *human) dead() {
	if me.animationFrame == len(me.animation)-1 {
		me.update = me.emptyUpdate
	} else {
		me.updateAnimation()
	}
}

func (me *human) missile() {
	if me.updateAnimation() == AnimationDone {
		me.animationFrame = 0
		me.animation = humanAnimationWalk
	}
}

func (me *human) walk() {
	if me.updateAnimation() == AnimationDone {
		me.animationFrame = 0
	}
}

func (me *human) updateFn() {
	switch me.status {
	case humanDead:
		me.dead()
	case humanMissile:
		me.missile()
	case humanIdle:
		break
	default:
		me.walk()
	}
	me.updateNetworkDelta()
}

func (me *human) emptyUpdate() {
}
