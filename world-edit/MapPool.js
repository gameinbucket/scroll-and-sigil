const MapPool_Size = 8;
const MapPool_Slice = MapPool_Size * MapPool_Size;
const MapPool_All = MapPool_Slice * MapPool_Size;
class MapPool
{
    constructor()
    {
        this.cells = [];
        this.mesh;
        this.begin_side;
        this.count_side;
        this.visibility;
        this.x;
        this.y;
        this.z;
    }
    static Init(pool, x, y, z)
    {
        pool.x = x;
        pool.y = y;
        pool.z = z;
        for (let z = 0; z < MapPool_Size; z++)
        {
            let zz = z * MapPool_Slice;
            for (let y = 0; y < MapPool_Size; y++)
            {
                let yy = y * MapPool_Size;
                for (let x = 0; x < MapPool_Size; x++)
                {
                    let c = new MapCell(MapCell_BlockGrass);
                    pool.cells[x + yy + zz] = c;
                }    
            }
        }
    }
    static Mesh(pool)
    {
        
    }
}