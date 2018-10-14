const TILE_SIZE = 16
const INV_TILE_SIZE = 1.0 / TILE_SIZE

const TILE_NONE = 0
const TILE_GROUND = 1
const TILE_RAILS_RIGHT = 2
const TILE_STAIRS_RIGHT = 3
const TILE_RAIL = 4
const TILE_WALL = 5
const TILE_WATER_TOP = 6
const TILE_WATER = 7

const TILE_SPRITE_SIZE = 1.0 / 128.0
const TILE_SPRITE_GROUND = Sprite.Build(0, 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_RAILS_RIGHT = Sprite.Build(17 * 1, 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_STAIRS_RIGHT = Sprite.Build(17 * 1, 17 * 1, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_RAIL = Sprite.Build(17 * 2, 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_WALL = Sprite.Build(17 * 3, 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_WATER_TOP = Sprite.Build(17 * 4, 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_WATER = Sprite.Build(17 * 4, 17 * 1, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)

class Tile {
    static Texture(tile) {
        switch (tile) {
            case TILE_GROUND:
                return TILE_SPRITE_GROUND
            case TILE_RAILS_RIGHT:
                return TILE_SPRITE_RAILS_RIGHT
            case TILE_STAIRS_RIGHT:
                return TILE_SPRITE_STAIRS_RIGHT
            case TILE_RAIL:
                return TILE_SPRITE_RAIL
            case TILE_WALL:
                return TILE_SPRITE_WALL
            case TILE_WATER_TOP:
                return TILE_SPRITE_WATER_TOP
            case TILE_WATER:
                return TILE_SPRITE_WATER
            default:
                return null
        }
    }
    static Empty(tile) {
        switch (tile) {
            case TILE_NONE:
            case TILE_RAILS_RIGHT:
            case TILE_STAIRS_RIGHT:
            case TILE_RAIL:
            case TILE_WALL:
            case TILE_WATER_TOP:
            case TILE_WATER:
                return true
            default:
                return false
        }
    }
}