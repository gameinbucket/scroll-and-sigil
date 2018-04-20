const MapCell_BlockGrass = 0;
const MapCell_BlockStone = 1;
const BLOCK_SPRITE_DIM = 16.0;
const BLOCK_SPRITE_SHEET_WIDTH = 1.0 / 256.0;
const BLOCK_SPRITE_SHEET_HEIGHT = 1.0 / 128.0;
const BLOCK_SPRITE_DIRT = Sprite.Build(1+17*0, 1+17*0, BLOCK_SPRITE_DIM, BLOCK_SPRITE_DIM, BLOCK_SPRITE_SHEET_WIDTH, BLOCK_SPRITE_SHEET_HEIGHT);
const BLOCK_SPRITE_GRASS = Sprite.Build(1+17*1, 1+17*0, BLOCK_SPRITE_DIM, BLOCK_SPRITE_DIM, BLOCK_SPRITE_SHEET_WIDTH, BLOCK_SPRITE_SHEET_HEIGHT);
class Block
{
    constructor(type)
    {
        this.type = type;
    }
    static Texture(type)
    {
        switch(type)
        {
        case MapCell_BlockGrass: return BLOCK_SPRITE_GRASS;
        case MapCell_BlockStone: return BLOCK_SPRITE_DIRT;
        }
        return 0.0;
    }
}