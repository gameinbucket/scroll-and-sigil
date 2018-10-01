const TILE_NONE = 0
const TILE_GRASS = 1
const TILE_STONE = 2
const TILE_SIZE = 16
const TILE_SPRITE_SHEET_WIDTH = 1.0 / 256.0
const TILE_SPRITE_SHEET_HEIGHT = 1.0 / 128.0
const TILE_SPRITE_DIRT = Sprite.Build(1 + 17 * 1, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SHEET_WIDTH, TILE_SPRITE_SHEET_HEIGHT)
const TILE_SPRITE_STONE = Sprite.Build(1 + 17 * 0, 1 + 17 * 0, TILE_SIZE, TILE_SIZE, TILE_SPRITE_SHEET_WIDTH, TILE_SPRITE_SHEET_HEIGHT)
class Tile {
    constructor() {
        this.type
    }
    static Texture(type) {
        switch (type) {
            case TILE_GRASS:
                return TILE_SPRITE_DIRT
            case TILE_STONE:
                return TILE_SPRITE_STONE
        }
        return 0.0
    }
    static Closed(type) {
        switch (type) {
            case TILE_NONE:
                return false
            case TILE_GRASS:
                return true
            case TILE_STONE:
                return true
        }
        return false
    }
}