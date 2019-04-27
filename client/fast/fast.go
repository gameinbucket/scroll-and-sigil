package fast

import "math"

const (
	pi      = float32(math.Pi)
	tau     = float32(math.Pi * 2.0)
	half_pi = float32(math.Pi / 2.0)
	b       = 4.0 / pi
	c       = -4.0 / (pi * pi)
	p       = 0.225
)

func Sin(x float32) float32 {
	if x > pi {
		x -= tau
	} else if x < -pi {
		x += tau
	}
	y := b*x + c*x
	if x < 0 {
		y *= -x
	} else {
		y *= x
	}
	return y
}

func Cos(x float32) float32 {
	return Sin(x + half_pi)
}
