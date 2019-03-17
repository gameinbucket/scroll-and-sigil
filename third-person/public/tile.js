const TILE_NONE = 0
const TILE_GROUND = 1
const TILE_RAILS_RIGHT = 2
const TILE_STAIRS_RIGHT = 3
const TILE_RAIL = 4
const TILE_WALL = 5
const TILE_WATER_TOP = 6
const TILE_WATER = 7
const TILE_RAILS_LEFT = 8
const TILE_STAIRS_LEFT = 9

const AMBIENT_LOW = 100
const AMBIENT_HALF = 175
const AMBIENT_FULL = 255

const TILE_TEXTURE = []
const TILE_CLOSED = []

class Tile {
    constructor() {
        this.type = TILE_NONE
        this.red = 0
        this.green = 0
        this.blue = 0
    }
    static Ambient(side1, side2, corner) {
        if (side1 && side2)
            return AMBIENT_LOW
        if (side1 || side2 || corner)
            return AMBIENT_HALF
        return AMBIENT_FULL
    }
}
