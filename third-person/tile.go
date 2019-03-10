package main

// Tile constants
const (
	TileNone        = 0
	TileGround      = 1
	TileRailsRight  = 2
	TileStairsRight = 3
	TileRail        = 4
	TileWall        = 5
	TileWaterTop    = 6
	TileWater       = 7
	TileRailsLeft   = 8
	TileStairsLeft  = 9
)

// Tile variables
var (
	TileClosed = []bool{
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
	}
	TileList = []string{
		"ground",
		"rails.right",
		"stairs.right",
		"rail",
		"wall",
		"water-top",
		"water",
		"rails-left",
		"stairs-left",
	}
	TileMap = map[string]int{
		"ground":       TileGround,
		"rails.right":  TileRailsRight,
		"stairs.right": TileStairsRight,
		"rail":         TileRail,
		"wall":         TileWall,
		"water-top":    TileWaterTop,
		"water":        TileWater,
		"rails-left":   TileRailsLeft,
		"stairs-left":  TileStairsLeft,
	}
)
