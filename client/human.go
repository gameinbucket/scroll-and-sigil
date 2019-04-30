package main

import "./render"

const (
	humanDead    = 0
	humanIdle    = 1
	humanWalk    = 2
	humanMelee   = 3
	humanMissile = 4
)

var (
	humanAnimationIdle    [][]*render.Sprite
	humanAnimationWalk    [][]*render.Sprite
	humanAnimationMelee   [][]*render.Sprite
	humanAnimationMissile [][]*render.Sprite
	humanAnimationDeath   [][]*render.Sprite
)

type human struct {
}

func humanInit(world *world, nid uint16, x, y, z, angle float32, health uint16, status uint8) *human {
	h := &human{}
	return h
}
