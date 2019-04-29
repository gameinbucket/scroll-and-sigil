package main

// Constants
const (
	TileNone = 0

	AmbientLow  = 100
	AmbientHalf = 175
	AmbientFull = 255
)

// Variables
var (
	TileLookup  = map[string]int{}
	TileTexture [][]float32
	TileClosed  []bool
)

// TileAmbient func
func TileAmbient(side1, side2, corner bool) int {
	if side1 && side2 {
		return AmbientLow
	} else if side1 || side2 || corner {
		return AmbientHalf
	}
	return AmbientFull
}

type tile struct {
	typeOf int
	red    int
	green  int
	blue   int
}

func tileInit() *tile {
	return &tile{}
}
