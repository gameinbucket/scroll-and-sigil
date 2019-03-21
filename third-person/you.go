package main

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// You struct
type You struct {
	*Thing
	Person *Person
}

// NewYou func
func NewYou(world *World, x, y, z float32) *You {
	you := &You{}
	you.Thing = &Thing{}
	you.UID = "you"
	you.NID = NextNID()
	you.World = world
	you.Thing.Update = you.Update
	you.Thing.Damage = you.Damage
	you.X = x
	you.Y = y
	you.Z = z
	you.Radius = 0.4
	you.Height = 1.0
	you.Speed = 0.1
	you.Health = 1
	world.AddThing(you.Thing)
	you.BlockBorders()
	you.AddToBlocks()
	return you
}

// Damage func
func (me *You) Damage(amount int) {
	fmt.Println("ouch!", amount)
}

// Update func
func (me *You) Update() {
	person := me.Person
	if person == nil {
		return
	}

	if person.InputCount == 0 {
		return
	}

	mf := false
	mb := false
	sl := false
	sr := false

	for i := 0; i < person.InputCount; i++ {
		input := person.InputQueue[i]

		if strings.HasPrefix(input, "a:") {
			angle := strings.Split(input, "a:")[1]
			value, _ := strconv.ParseFloat(angle, 32)
			me.Angle = float32(value)
		}

		if !mf && input == "mf" {
			me.DX += float32(math.Sin(float64(me.Angle))) * me.Speed
			me.DZ -= float32(math.Cos(float64(me.Angle))) * me.Speed
			mf = true
		}

		if !mb && input == "mb" {
			me.DX -= float32(math.Sin(float64(me.Angle))) * me.Speed
			me.DZ += float32(math.Cos(float64(me.Angle))) * me.Speed
			mb = true
		}

		if !sl && input == "sl" {
			me.DX -= float32(math.Cos(float64(me.Angle))) * me.Speed
			me.DZ -= float32(math.Sin(float64(me.Angle))) * me.Speed
			sl = true
		}

		if !sr && input == "sr" {
			me.DX += float32(math.Cos(float64(me.Angle))) * me.Speed
			me.DZ += float32(math.Sin(float64(me.Angle))) * me.Speed
			sr = true
		}
	}
	person.InputCount = 0

	me.Integrate()

	me.World.Snapshot.WriteString("{n:")
	me.World.Snapshot.WriteString(me.NID)
	me.World.Snapshot.WriteString(",x:")
	me.World.Snapshot.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	me.World.Snapshot.WriteString(",y:")
	me.World.Snapshot.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	me.World.Snapshot.WriteString(",z:")
	me.World.Snapshot.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	me.World.Snapshot.WriteString(",a:")
	me.World.Snapshot.WriteString(strconv.FormatFloat(float64(me.Angle), 'f', -1, 32))
	me.World.Snapshot.WriteString("},")
}
