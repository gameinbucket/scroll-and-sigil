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