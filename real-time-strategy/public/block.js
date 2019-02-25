const BLOCK_NONE = 0;
const BLOCK_GRASS = 1;
const BLOCK_STONE = 2;
const BLOCK_SPRITE_DIM = 16.0;
const BLOCK_SPRITE_SHEET_WIDTH = 1.0 / 256.0;
const BLOCK_SPRITE_SHEET_HEIGHT = 1.0 / 128.0;
const BLOCK_SPRITE_DIRT = Sprite.Build(1 + 17 * 1, 1 + 17 * 0, BLOCK_SPRITE_DIM, BLOCK_SPRITE_DIM, BLOCK_SPRITE_SHEET_WIDTH, BLOCK_SPRITE_SHEET_HEIGHT);
const BLOCK_SPRITE_STONE = Sprite.Build(1 + 17 * 0, 1 + 17 * 0, BLOCK_SPRITE_DIM, BLOCK_SPRITE_DIM, BLOCK_SPRITE_SHEET_WIDTH, BLOCK_SPRITE_SHEET_HEIGHT);
class Block {
    constructor() {
        this.type;
        this.raise;
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
    static Texture(type) {
        switch(type) {
        case BLOCK_GRASS: return BLOCK_SPRITE_DIRT;
        case BLOCK_STONE: return BLOCK_SPRITE_STONE;
        }
        return 0.0;
    }
    static Closed(type) {
        switch(type) {
        case BLOCK_NONE: return false;
        case BLOCK_GRASS: return true;
        case BLOCK_STONE: return true;
        }
        return false;
    }
    static PointerClosed(block) {
        if (block === null) {
            return true;
        }
        return Block.Closed(block.type);
    }
    static Ambient(side1, side2, corner) {
        if (side1 && side2) {
            return 175;
        }
        if (side1 || side2 || corner) {
            return 215;
        }
        return 255;
    }
}