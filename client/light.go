package main

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
