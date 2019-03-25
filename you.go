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
func NewYou(world *World, person *Person, x, y, z float32) *You {
	you := &You{}
	you.Thing = &Thing{}
	you.UID = "you"
	you.NID = NextNID()
	you.World = world
	you.Thing.Update = you.Update
	you.Thing.Damage = you.Damage
	you.Thing.Snap = you.Snap
	you.Thing.Save = you.Save
	you.X = x
	you.Y = y
	you.Z = z
	you.Radius = 0.4
	you.Height = 1.0
	you.Speed = 0.1
	you.Health = 1
	you.Person = person
	world.AddThing(you.Thing)
	you.BlockBorders()
	you.AddToBlocks()
	return you
}

// Damage func
func (me *You) Damage(amount int) {
	fmt.Println("ouch!", amount)
	me.DeltaHealth = true
}

// Save func
func (me *You) Save(snap *strings.Builder) {
	snap.WriteString("{u:")
	snap.WriteString(me.UID)
	snap.WriteString(",n:")
	snap.WriteString(me.NID)
	snap.WriteString(",x:")
	snap.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	snap.WriteString(",y:")
	snap.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	snap.WriteString(",z:")
	snap.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	snap.WriteString(",a:")
	snap.WriteString(strconv.FormatFloat(float64(me.Angle), 'f', -1, 32))
	snap.WriteString(",h:")
	snap.WriteString(strconv.Itoa(me.Health))
	snap.WriteString("}")
}

// Snap func
func (me *You) Snap(snap *strings.Builder) {
	snap.WriteString("{n:")
	snap.WriteString(me.NID)
	snap.WriteString(",x:")
	snap.WriteString(strconv.FormatFloat(float64(me.X), 'f', -1, 32))
	snap.WriteString(",y:")
	snap.WriteString(strconv.FormatFloat(float64(me.Y), 'f', -1, 32))
	snap.WriteString(",z:")
	snap.WriteString(strconv.FormatFloat(float64(me.Z), 'f', -1, 32))
	snap.WriteString(",a:")
	snap.WriteString(strconv.FormatFloat(float64(me.Angle), 'f', -1, 32))
	if me.DeltaHealth {
		snap.WriteString(",h:")
		snap.WriteString(strconv.Itoa(me.Health))
		me.DeltaHealth = false
	}
	snap.WriteString("},")
}

// Update func
func (me *You) Update() {
	person := me.Person

	if person != nil && person.InputCount > 0 {

		moved := false

		for i := 0; i < person.InputCount; i++ {
			input := person.InputQueue[i]

			if !moved {
				if input == "m" {
					me.DX += float32(math.Sin(float64(me.Angle))) * me.Speed
					me.DZ -= float32(math.Cos(float64(me.Angle))) * me.Speed
					moved = true
				} else if strings.HasPrefix(input, "a:") {
					angle := strings.Split(input, "a:")[1]
					value, _ := strconv.ParseFloat(angle, 32)
					me.Angle = float32(value)

					me.DX += float32(math.Sin(float64(me.Angle))) * me.Speed
					me.DZ -= float32(math.Cos(float64(me.Angle))) * me.Speed
					moved = true
				}
			}
		}
		person.InputCount = 0
	}

	me.Integrate()

	me.Snap(&me.World.Snapshot)
}
