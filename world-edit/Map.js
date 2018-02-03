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
}