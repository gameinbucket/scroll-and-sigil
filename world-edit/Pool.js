const POOL_DIM = 8;
const POOL_SLICE = POOL_DIM * POOL_DIM;
const POOL_ALL = POOL_SLICE * POOL_DIM;
const POOL_MESH = new RenderCopy(3, 0, 2, POOL_ALL * 6 * 4, POOL_ALL * 6);
class Pool
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
        for (let i = 0; i < POOL_DIM; i++)
        {
            let c = new Block(MapCell_BlockGrass);
            pool.cells[i] = c;
            x++;
            if (x == POOL_DIM)
            {
                x = 0;
                y++;
                if (y == POOL_DIM)
                {
                    y = 0;
                    z++;
                }
            }
        }
    }
    static Mesh(pool, g, gl)
    {
        RenderBuffer.Zero(POOL_MESH);
        for (let side = 0; side < 6; side++)
        {
            let mesh_begin_index = POOL_MESH.index_pos;
            
            let x = 0;
            let y = 0;
            let z = 0;
            for (let i = 0; i < POOL_ALL; i++)
            {
                let type = MapCell_BlockGrass;
                if (Math.random() < 0.5)
                {
                    type = MapCell_BlockStone;
                }
                let texture = Block.Texture(type);

                RenderCell.Side(POOL_MESH, side, x, y, z, texture[0], texture[1], texture[2], texture[3]);
                
                x++;
                if (x == POOL_DIM)
                {
                    x = 0;
                    y++;
                    if (y == POOL_DIM)
                    {
                        y = 0;
                        z++;
                    }
                }
            }

            pool.begin_side[side] = mesh_begin_index;
            pool.count_side[side] = POOL_MESH.index_pos - mesh_begin_index;
        }
        pool.mesh = RenderBuffer.InitCopy(gl, POOL_MESH);
    }
}