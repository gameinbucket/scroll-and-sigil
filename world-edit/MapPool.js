const MapPool_Size = 8;
const MapPool_Slice = MapPool_Size * MapPool_Size;
const MapPool_All = MapPool_Slice * MapPool_Size;
class MapPool
{
    constructor()
    {
        this.cells = [];
        this.mesh;
        this.begin_side = [];
        this.count_side = [];
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
        let mesh = pool.mesh;
        RenderBuffer.Zero(mesh);
        for (let side = 0; side < 6; side++)
        {
            let mesh_begin_index = mesh.index_pos;
            let type = MapCell_BlockGrass;
            let texture_index = MapCell.TextureIndex(type);
            RenderCell.Side(mesh, side, xs, ys, zs, 1, 1, texture_index);

            pool.begin_side[side] = mesh_begin_index;
            pool.count_side[side] = mesh.index_pos - mesh_begin_index;
        }
    }
}