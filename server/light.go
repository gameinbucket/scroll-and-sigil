package main

import (
	"bytes"
	"encoding/binary"
)

// light struct
type light struct {
	X   int
	Y   int
	Z   int
	RGB int
}

// NewLight func
func NewLight(x, y, z, rgb int) *light {
	light := &light{X: x, Y: y, Z: z, RGB: rgb}
	return light
}

// Save func
func (me *light) Save(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, uint8(me.X))
	binary.Write(raw, binary.LittleEndian, uint8(me.Y))
	binary.Write(raw, binary.LittleEndian, uint8(me.Z))
	binary.Write(raw, binary.LittleEndian, int32(me.RGB))
}
