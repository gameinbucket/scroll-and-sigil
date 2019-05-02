package main

import "./render"

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
	human.blockBorders()
	human.addToBlocks()
	return human
}
