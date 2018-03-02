const MapPool_Size = 8;
const MapPool_Slice = MapPool_Size * MapPool_Size;
const MapPool_All = MapPool_Slice * MapPool_Size;
class MapPool
{
    constructor(g, gl)
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
    static Init(pool, px, py, pz)
    {
        pool.x = px;
        pool.y = py;
        pool.z = pz;
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < MapPool_Size; i++)
        {
            let c = new MapCell(MapCell_BlockGrass);
            pool.cells[i] = c;
            x++;
            if (x == MapPool_Size)
            {
                x = 0;
                y++;
                if (y == MapPool_Size)
                {
                    y = 0;
                    z++;
                }
            }
        }
    }
    static Mesh(pool, g, gl)
    {
        pool.mesh = new RenderBuffer(g, gl, 2, 0, 2, 400, 600);
        let mesh = pool.mesh;
        RenderBuffer.Zero(mesh);
        for (let side = 0; side < 6; side++)
        {
            let mesh_begin_index = mesh.index_pos;
            let type = MapCell_BlockGrass;
            let texture_index = MapCell.TextureIndex(type);

            let x = 0;
            let y = 0;
            let z = 0;
            for (let i = 0; i < MapPool_Size; i++)
            {
                RenderCell.Side(mesh, side, x, y, z, 1, 1, texture_index);
                
                x++;
                if (x == MapPool_Size)
                {
                    x = 0;
                    y++;
                    if (y == MapPool_Size)
                    {
                        y = 0;
                        z++;
                    }
                }
            }

            pool.begin_side[side] = mesh_begin_index;
            pool.count_side[side] = mesh.index_pos - mesh_begin_index;
        }
    }
}