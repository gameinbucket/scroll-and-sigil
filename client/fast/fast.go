package fast

import "math"

// Constants
const (
	Pi     = float32(math.Pi)
	Tau    = float32(math.Pi * 2.0)
	HalfPi = float32(math.Pi * 0.5)
)

// Sin func
func Sin(x float32) float32 {
	const (
		b = 4.0 / Pi
		c = -4.0 / (Pi * Pi)
		p = 0.225
	)
	if x > Pi {
		x -= Tau
	} else if x < -Pi {
		x += Tau
	}
	if x < 0 {
		return (b*x + c*x) * -x
	}
	return (b*x + c*x) * x

}

// Cos func
func Cos(x float32) float32 {
	return Sin(x + HalfPi)
}
