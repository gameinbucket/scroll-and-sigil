package main

type you struct {
	*thing
	status uint8
	camera *camera
}

func youInit(world *world, nid uint16, x, y, z, angle float32, health uint16, status uint8) *you {
	you := &you{}
	you.thing = &thing{}
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
	you.blockBorders()
	you.addToBlocks()
	return you
}
