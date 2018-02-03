const MapCell_BlockGrass = 0;
const MapCell_BlockStone = 1;
class MapCell
{
    constructor(type)
    {
        this.type = type;
    }
    static TextureIndex(type)
    {
        switch(type)
        {
        case MapCell_BlockGrass: return 0.0;
        case MapCell_BlockStone: return 1.0;
        }
        return 0.0;
    }
}