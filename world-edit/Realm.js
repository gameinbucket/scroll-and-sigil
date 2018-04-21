const REALM_POSITIVE_X = 0;
const REALM_POSITIVE_Y = 1;
const REALM_POSITIVE_Z = 2;
const REALM_NEGATIVE_X = 3;
const REALM_NEGATIVE_Y = 4;
const REALM_NEGATIVE_Z = 5;
class Realm
{
    constructor(chunk_w, chunk_h, chunk_l)
    {
        this.chunk_w = chunk_w;
        this.chunk_h = chunk_h;
        this.chunk_l = chunk_l;
        this.chunk_slice = chunk_w * chunk_h;
        this.chunk_all = chunk_w * chunk_h * chunk_l;
        this.chunks = [];
    }
    static Init(realm)
    {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < realm.chunk_all; i++)
        {
            let p = new Chunk();
            Chunk.Init(p, x, y, z);
            realm.chunks[i] = p;
            x++;
            if (x == realm.chunk_w)
            {
                x = 0;
                y++;
                if (y == realm.chunk_h)
                {
                    y = 0;
                    z++;
                }
            }
        }
    }
    get_block_unsafe(cx, cy, cz, bx, by, bz) {
        let chunk = this.chunks[cx + cy * this.chunk_w + cz * this.chunk_slice];
        return chunk.blocks[bx + by * CHUNK_DIM + bz * CHUNK_SLICE].type;
    }
    get_block(cx, cy, cz, bx, by, bz) {
        while (bx < 0){
            bx += CHUNK_DIM;
            cx--;
        }
        while (bx >= CHUNK_DIM) {
            bx -= CHUNK_DIM;
            cx++;
        }
        while (by < 0) {
            by += CHUNK_DIM;
            cy--;
        }
        while (by >= CHUNK_DIM) {
            by -= CHUNK_DIM;
            cy++;
        }
        while (bz < 0) {
            bz += CHUNK_DIM;
            cz--;
        }
        while (bz >= CHUNK_DIM) {
            bz -= CHUNK_DIM;
            cz++;
        }
        let chunk = this.get_chunk(cx, cy, cz);
        if (chunk === null) {
            return BLOCK_NONE;
        }
        return chunk.get_block_unsafe(bx, by, bz);
    }
    get_chunk(x, y, z) {
        if (x < 0 || x >= this.chunk_w) {
            return null;
        }
        if (y < 0 || y >= this.chunk_h) {
            return null;
        }
        if (z < 0 || z >= this.chunk_l) {
            return null;
        }
        return this.chunks[x + y * this.chunk_w + z * this.chunk_slice];
    }
    static Mesh(realm, g, gl)
    {
        for (let i = 0; i < realm.chunk_all; i++)
        {
            Chunk.Mesh(realm, realm.chunks[i], g, gl);
        }
    }
    static Render(gl, realm, x, y, z)
    {
        for (let i = 0; i < realm.chunk_all; i++)
        {
            let chunk = realm.chunks[i];
            let mesh = chunk.mesh;
            if (mesh.vertex_pos == 0)
            {
                continue;
            }
            RenderSystem.BindVao(gl, mesh);

            if (x == chunk.x)
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_POSITIVE_X], chunk.count_side[REALM_POSITIVE_X]);
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_NEGATIVE_X], chunk.count_side[REALM_NEGATIVE_X]);
            }
            else if (x > chunk.x)
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_POSITIVE_X], chunk.count_side[REALM_POSITIVE_X]);
            }
            else
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_NEGATIVE_X], chunk.count_side[REALM_NEGATIVE_X]);
            }
            
            if (y == chunk.y)
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_POSITIVE_Y], chunk.count_side[REALM_POSITIVE_Y]);
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_NEGATIVE_Y], chunk.count_side[REALM_NEGATIVE_Y]);
            }
            else if (y > chunk.y)
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_POSITIVE_Y], chunk.count_side[REALM_POSITIVE_Y]);
            }
            else
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_NEGATIVE_Y], chunk.count_side[REALM_NEGATIVE_Y]);
            }

            if (z == chunk.z)
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_POSITIVE_Z], chunk.count_side[REALM_POSITIVE_Z]);
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_NEGATIVE_Z], chunk.count_side[REALM_NEGATIVE_Z]);
            }
            else if (z > chunk.z)
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_POSITIVE_Z], chunk.count_side[REALM_POSITIVE_Z]);
            }
            else
            {
                RenderSystem.DrawRange(gl, chunk.begin_side[REALM_NEGATIVE_Z], chunk.count_side[REALM_NEGATIVE_Z]);
            }
        }
    }
}