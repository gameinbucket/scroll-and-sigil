const Map_PositiveX = 0;
const Map_PositiveY = 1;
const Map_PositiveZ = 2;
const Map_NegativeX = 3;
const Map_NegativeY = 4;
const Map_NegativeZ = 5;
class Map
{
    constructor(pool_w, pool_h, pool_l)
    {
        this.pool_w = pool_w;
        this.pool_h = pool_h;
        this.pool_l = pool_l;
        this.pool_slice = pool_w * pool_h;
        this.pool_all = pool_w * pool_h * pool_l;
        this.pools = [];
    }
    static Init(map)
    {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < map.pool_all; i++)
        {
            let p = new MapPool();
            MapPool.Init(p, x, y, z);
            map.pools[i] = p;
            x++;
            if (x == map.pool_w)
            {
                x = 0;
                y++;
                if (y == map.pool_h)
                {
                    y = 0;
                    z++;
                }
            }
        }
    }
    static Mesh(map)
    {
        for (let i = 0; i < map.pool_all; i++)
        {
            MapPool.Mesh(map.pools[i]);
        }
    }
    static Render(gl, map, x, y, z)
    {
        for (let i = 0; i < map.pool_all; i++)
        {
            let pool = map.pools[i];
            let mesh = pool.mesh;
            if (mesh.vertex_pos == 0)
            {
                continue;
            }
            RenderSystem.BindVao(gl, mesh);
            if (x == pool.x)
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_PositiveX], pool.count_side[Map_PositiveX]);
                RenderSystem.DrawRange(gl, pool.begin_side[Map_NegativeX], pool.count_side[Map_NegativeX]);
            }
            else if (x > pool.x)
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_PositiveX], pool.count_side[Map_PositiveX]);
            }
            else
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_NegativeX], pool.count_side[Map_NegativeX]);
            }
            if (y == pool.y)
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_PositiveY], pool.count_side[Map_PositiveY]);
                RenderSystem.DrawRange(gl, pool.begin_side[Map_NegativeY], pool.count_side[Map_NegativeY]);
            }
            else if (y > pool.y)
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_PositiveY], pool.count_side[Map_PositiveY]);
            }
            else
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_NegativeY], pool.count_side[Map_NegativeY]);
            }
            if (z == pool.z)
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_PositiveZ], pool.count_side[Map_PositiveZ]);
                RenderSystem.DrawRange(gl, pool.begin_side[Map_NegativeZ], pool.count_side[Map_NegativeZ]);
            }
            else if (z > pool.z)
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_PositiveZ], pool.count_side[Map_PositiveZ]);
            }
            else
            {
                RenderSystem.DrawRange(gl, pool.begin_side[Map_NegativeZ], pool.count_side[Map_NegativeZ]);
            }
        }
    }
}