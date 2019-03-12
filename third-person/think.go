package main

import (
	"math"
)

// Think struct
type Think struct {
	Thing *Thing
	Think func(thing *Thing, world *World)
}

// ThinkWander func
func ThinkWander(thing *Thing, world *World) {
	pace := float32(0.1)
	thing.DX += float32(math.Sin(float64(thing.Angle))) * pace
	thing.DZ -= float32(math.Cos(float64(thing.Angle))) * pace
}
