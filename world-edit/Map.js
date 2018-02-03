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
        
    }
    static Render(gl, map, x, y, z)
    {
        for (let i = 0; i < map.pool_all; i++)
        {
            let pool = map.pools[i];
            let mesh = pool.mesh;
            if (mesh.vertexPos == 0)
            {
                continue;
            }
            RenderSystem.BindVao(gl, mesh);
            if (x == pool.x)
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[PosX], obj.countSide[PosX])
                g.DrawRange(obj.beginSide[NegX], obj.countSide[NegX])
            }
            else if (x > pool.x)
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[PosX], obj.countSide[PosX])
            }
            else
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[NegX], obj.countSide[NegX])
            }

            if (y == pool.y)
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[PosY], obj.countSide[PosY])
                g.DrawRange(obj.beginSide[NegY], obj.countSide[NegY])
            }
            else if (y > pool.y)
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[PosY], obj.countSide[PosY])
            }
            else
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[NegY], obj.countSide[NegY])
            }

            if (z == pool.z)
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[PosZ], obj.countSide[PosZ])
                g.DrawRange(obj.beginSide[NegZ], obj.countSide[NegZ])
            }
            else if (z > pool.z)
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[PosZ], obj.countSide[PosZ])
            }
            else
            {
                RenderSystem.DrawRange(gl, pool.beginSide[], pool.countSide[]);
                g.DrawRange(obj.beginSide[NegZ], obj.countSide[NegZ])
            }
        }
    }
}