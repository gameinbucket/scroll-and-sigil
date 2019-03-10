package main

import (
	"math"
)

// ThinkYou func
func ThinkYou(me *Person, world *World) {
	if me.InputCount == 0 {
		return
	}

	thing := me.Character
	input := me.InputQueue[0]

	if input == "tl" {
		thing.Angle -= 0.05
	}

	if input == "tr" {
		thing.Angle += 0.05
	}

	pace := float32(0.1)

	if input == "mf" {
		thing.DX += float32(math.Sin(float64(thing.Angle))) * pace
		thing.DZ -= float32(math.Cos(float64(thing.Angle))) * pace
	}

	if input == "mb" {
		thing.DX -= float32(math.Sin(float64(thing.Angle))) * pace
		thing.DZ += float32(math.Cos(float64(thing.Angle))) * pace
	}

	if input == "sr" {
		thing.DX -= float32(math.Cos(float64(thing.Angle))) * pace
		thing.DZ -= float32(math.Sin(float64(thing.Angle))) * pace
	}

	if input == "sl" {
		thing.DX += float32(math.Cos(float64(thing.Angle))) * pace
		thing.DZ += float32(math.Sin(float64(thing.Angle))) * pace
	}
}
