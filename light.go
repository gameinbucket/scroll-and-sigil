package main

import (
	"bytes"
	"encoding/binary"
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

// SaveBinary func
func (me *Light) SaveBinary(raw *bytes.Buffer) {
	binary.Write(raw, binary.LittleEndian, uint8(me.X))
	binary.Write(raw, binary.LittleEndian, uint8(me.Y))
	binary.Write(raw, binary.LittleEndian, uint8(me.Z))
	binary.Write(raw, binary.LittleEndian, int32(me.RGB))
}
