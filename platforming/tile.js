const TILE_SIZE = 16

const TILE_NONE = 0
const TILE_GRASS = 1
const TILE_DIRT = 2
const TILE_DIRT_RIGHT_EDGE = 3
const TILE_FENCE = 4
const TILE_GRASS_SLOPE_RIGHT = 5
const TILE_GRASS_SLOPE_LEFT = 6

const TILE_SPRITE_SIZE = 1.0 / 128.0
const TILE_SPRITE_GRASS = Sprite.Build(1 + 17 * 0, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_DIRT_RIGHT_EDGE = Sprite.Build(1 + 17 * 1, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_FENCE = Sprite.Build(1 + 17 * 2, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_DIRT = Sprite.Build(1 + 17 * 3, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_GRASS_SLOPE_RIGHT = Sprite.Build(1 + 17 * 4, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_GRASS_SLOPE_LEFT = Sprite.Build(1 + 17 * 5, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)

class Tile {
    static Texture(tile) {
        switch (tile) {
            case TILE_GRASS:
                return TILE_SPRITE_GRASS
            case TILE_DIRT:
                return TILE_SPRITE_DIRT
            case TILE_DIRT_RIGHT_EDGE:
                return TILE_SPRITE_DIRT_RIGHT_EDGE
            case TILE_FENCE:
                return TILE_SPRITE_FENCE
            case TILE_GRASS_SLOPE_LEFT:
                return TILE_SPRITE_GRASS_SLOPE_LEFT
            case TILE_GRASS_SLOPE_RIGHT:
                return TILE_SPRITE_GRASS_SLOPE_RIGHT
            default:
                return null
        }
    }
    static Empty(tile) {
        switch (tile) {
            case TILE_NONE:
            case TILE_DIRT:
            case TILE_DIRT_RIGHT_EDGE:
            case TILE_FENCE:
                return true
            default:
                return false
        }
    }
    static Floor(tile, x) {
        switch (tile) {
            case TILE_GRASS_SLOPE_LEFT:
                return TILE_SIZE - x
            case TILE_GRASS_SLOPE_RIGHT:
                return x
            default:
                return TILE_SIZE
        }
    }
}