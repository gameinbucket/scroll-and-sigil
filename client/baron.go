package main

import "./render"

var (
	baronAnimationIdle    [][]*render.Sprite
	baronAnimationWalk    [][]*render.Sprite
	baronAnimationMelee   [][]*render.Sprite
	baronAnimationMissile [][]*render.Sprite
	baronAnimationDeath   [][]*render.Sprite
)

type baron struct {
}

func baronInit(world *world, nid uint16, x, y, z float32, direction uint8, health uint16, status uint8) *baron {
	b := &baron{}
	return b
}
