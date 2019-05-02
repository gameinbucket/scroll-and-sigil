package main

import "./render"

const (
	baronSleep   = uint8(0)
	baronDead    = uint8(1)
	baronLook    = uint8(2)
	baronChase   = uint8(3)
	baronMelee   = uint8(4)
	baronMissile = uint8(5)
)

var (
	baronAnimationIdle    [][]*render.Sprite
	baronAnimationWalk    [][]*render.Sprite
	baronAnimationMelee   [][]*render.Sprite
	baronAnimationMissile [][]*render.Sprite
	baronAnimationDeath   [][]*render.Sprite
)

type baron struct {
	*thing
}

func baronInit(world *world, nid uint16, x, y, z float32, direction uint8, health uint16, status uint8) *baron {
	b := &baron{}
	return b
}
