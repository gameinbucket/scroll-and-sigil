package main

import (
	"bytes"
	"encoding/binary"
	"math"
	"math/rand"
	"strconv"
	"syscall/js"
)

const (
	inputOpNewMove      = uint8(0)
	inputOpContinueMove = uint8(1)
	inputOpMissile      = uint8(2)
	inputOpSearch       = uint8(3)
	inputOpChat         = uint8(4)
)

type you struct {
	*thing
	status     uint8
	camera     *camera
	socket     js.Value
	socketSend map[uint8]interface{}
}

func youInit(world *world, nid uint16, x, y, z, angle float32, health uint16, status uint8) *you {
	you := &you{}
	you.thing = &thing{}
	you.thing.update = you.updateFn
	you.world = world
	you.uid = HumanUID
	you.sid = "baron"
	you.nid = nid
	you.animation = humanAnimationWalk
	you.x = x
	you.y = y
	you.z = z
	you.angle = angle
	you.oldX = x
	you.oldY = y
	you.oldZ = z
	you.radius = 0.4
	you.height = 1.0
	you.speed = 0.1
	you.health = health
	you.status = status
	world.addThing(you.thing)
	world.netLookup[you.nid] = you
	you.blockBorders()
	you.addToBlocks()
	return you
}

func (me *you) netUpdate(dat *bytes.Reader, delta uint8) {
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

func (me *you) netUpdateState(status uint8) {
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
	case humanIdle:
		me.animation = humanAnimationIdle
	default:
		me.animation = humanAnimationWalk
	}
	me.status = status
}

func (me *you) netUpdateHealth(health uint16) {
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

func (me *you) dead() {
	if me.animationFrame == len(me.animation)-1 {
		me.update = me.emptyUpdate
	} else {
		me.updateAnimation()
	}
}

func (me *you) missile() {
	if me.updateAnimation() == AnimationDone {
		me.animationFrame = 0
		me.animation = humanAnimationWalk
	}
}

func (me *you) walk() {
	if InputIsKeyPress("p") {
		me.socketSend[inputOpSearch] = true
		me.socketSend[inputOpChat] = "todo test chat"
	}
}

func (me *you) updateFn() {
	switch me.status {
	case humanDead:
		me.dead()
	case humanMissile:
		me.missile()
	default:
		me.walk()
	}
	me.updateNetworkDelta()
}

func (me *you) emptyUpdate() {
}
