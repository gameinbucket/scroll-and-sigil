const TILE_SIZE = 16
const TILE_SIZE_HALF = TILE_SIZE * 0.5
const INV_TILE_SIZE = 1.0 / TILE_SIZE

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

const TILE_SPRITE_SIZE = 1.0 / 128.0
const TILE_TEXTURE = []
const TILE_EMPTY = []

const BLOCK_NONE = 0
const BLOCK_GRASS = 1
const BLOCK_STONE = 2
const BLOCK_SPRITE_DIM = 16.0
const BLOCK_SPRITE_SHEET_WIDTH = 1.0 / 128.0
const BLOCK_SPRITE_SHEET_HEIGHT = 1.0 / 128.0
let BLOCK_SPRITE_DIRT = Sprite.Simple(1 + 17 * 1, 1 + 17 * 0, BLOCK_SPRITE_DIM, BLOCK_SPRITE_DIM, BLOCK_SPRITE_SHEET_WIDTH)
let BLOCK_SPRITE_STONE = Sprite.Simple(1 + 17 * 0, 1 + 17 * 0, BLOCK_SPRITE_DIM, BLOCK_SPRITE_DIM, BLOCK_SPRITE_SHEET_WIDTH)

const TILE_LIST = [
    "ground",
    "rails.right",
    "stairs.right",
    "rail",
    "wall",
    "water-top",
    "water",
    "rails-left",
    "stairs-left",
]

const TILE_MAP = {
    "ground": TILE_GROUND,
    "rails.right": TILE_RAILS_RIGHT,
    "stairs.right": TILE_STAIRS_RIGHT,
    "rail": TILE_RAIL,
    "wall": TILE_WALL,
    "water-top": TILE_WATER_TOP,
    "water": TILE_WATER,
    "rails-left": TILE_RAILS_LEFT,
    "stairs-left": TILE_STAIRS_LEFT,
}

class Tile {
    constructor() {
        this.type = TILE_NONE
        this.red = 0
        this.green = 0
        this.blue = 0
    }
    static Texture(type) {
        switch (type) {
            case BLOCK_GRASS:
                return BLOCK_SPRITE_DIRT
            case BLOCK_STONE:
                return BLOCK_SPRITE_STONE
        }
        return 0.0
    }
    static Closed(type) {
        switch (type) {
            case BLOCK_NONE:
                return false
            case BLOCK_GRASS:
                return true
            case BLOCK_STONE:
                return true
        }
        return false
    }
    static PointerClosed(block) {
        if (block === null) {
            return true
        }
        return Tile.Closed(block.type)
    }
    static Ambient(side1, side2, corner) {
        if (side1 && side2) {
            return 175
        }
        if (side1 || side2 || corner) {
            return 215
        }
        return 255
    }
}
