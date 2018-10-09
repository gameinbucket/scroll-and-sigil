const TILE_SIZE = 16

const TILE_NONE = 0
const TILE_GRASS = 1
const TILE_DIRT = 2
const TILE_DIRT_RIGHT_EDGE = 3
const TILE_FENCE = 4

const TILE_SPRITE_SIZE = 1.0 / 128.0
const TILE_SPRITE_GRASS = Sprite.Build(1 + 17 * 0, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_DIRT_RIGHT_EDGE = Sprite.Build(1 + 17 * 1, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_FENCE = Sprite.Build(1 + 17 * 2, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)
const TILE_SPRITE_DIRT = Sprite.Build(1 + 17 * 3, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE)

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
            default:
                return null
        }
    }
    static Empty(tile) {
        switch (tile) {
            case TILE_NONE:
            case TILE_FENCE:
                return true
            default:
                return false
        }
    }
}