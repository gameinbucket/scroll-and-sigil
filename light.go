package main

import (
	"strconv"
	"strings"
)

// Light struct
type Light struct {
	X   int
	Y   int
	Z   int
	RGB int
}

// NewLight func
func NewLight(x, y, z, rgb int) *Light {
	light := &Light{X: x, Y: y, Z: z, RGB: rgb}
	return light
}

// Save func
func (me *Light) Save(data *strings.Builder) {
	data.WriteString("{x:")
	data.WriteString(strconv.Itoa(me.X))
	data.WriteString(",y:")
	data.WriteString(strconv.Itoa(me.Y))
	data.WriteString(",z:")
	data.WriteString(strconv.Itoa(me.Z))
	data.WriteString(",v:")
	data.WriteString(strconv.Itoa(me.RGB))
	data.WriteString("}")
}
