const CHUNK_DIM = 8;
const CHUNK_SLICE = CHUNK_DIM * CHUNK_DIM;
const CHUNK_ALL = CHUNK_SLICE * CHUNK_DIM;
const CHUNK_MESH = new RenderCopy(3, 0, 2, CHUNK_ALL * 6 * 4, CHUNK_ALL * 6 * 6);
const SLICE_X = [2, 1, 0, 2, 1, 0];
const SLICE_Y = [0, 2, 1, 0, 2, 1];
const SLICE_Z = [1, 0, 2, 1, 0, 2];
const SLICE_TOWARDS = [1, 1, 1, -1, -1, -1];
const SLICE = new Array(3);
const SLICE_TEMP = new Array(3);
class Chunk
{
    constructor(g, gl)
    {
        this.blocks = [];
        this.mesh;
        this.begin_side = new Array(6);
        this.count_side = new Array(6);
        this.x;
        this.y;
        this.z;
    }
    static Init(chunk, px, py, pz)
    {
        chunk.x = px;
        chunk.y = py;
        chunk.z = pz;
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < CHUNK_ALL; i++)
        {
            let type = Math.random() > 0.5 ? BLOCK_GRASS : BLOCK_STONE;
            let block = new Block(type);
            chunk.blocks[i] = block;
            x++;
            if (x == CHUNK_DIM)
            {
                x = 0;
                y++;
                if (y == CHUNK_DIM)
                {
                    y = 0;
                    z++;
                }
            }
        }
    }
    get_block_unsafe(x, y, z) {
        return this.blocks[x + y * CHUNK_DIM + z * CHUNK_SLICE].type;
    }
    static Mesh(realm, chunk, g, gl)
    {
        RenderBuffer.Zero(CHUNK_MESH);
        for (let side = 0; side < 6; side++)
        {
            let mesh_begin_index = CHUNK_MESH.index_pos;
            let ptr_x = SLICE_X[side];
		    let ptr_y = SLICE_Y[side];
		    let ptr_z = SLICE_Z[side];
		    let toward = SLICE_TOWARDS[side];
            for (SLICE[2] = 0; SLICE[2] < CHUNK_DIM; SLICE[2]++)
            {
                for (SLICE[1] = 0; SLICE[1] < CHUNK_DIM; SLICE[1]++)
                {
                    for (SLICE[0] = 0; SLICE[0] < CHUNK_DIM; SLICE[0]++)
                    {
                        let type = chunk.get_block_unsafe(SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z]);
                        if (type === BLOCK_NONE)
                        {
                            continue;
                        }
                        SLICE_TEMP[0] = SLICE[0];
                        SLICE_TEMP[1] = SLICE[1];
                        SLICE_TEMP[2] = SLICE[2] + toward;
                        if (Block.Closed(realm.get_block(chunk.x, chunk.y, chunk.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z])))
                        {
                            continue;
                        }
                        let texture = Block.Texture(type);
                        let bx = SLICE[ptr_x] + CHUNK_DIM * chunk.x;
                        let by = SLICE[ptr_y] + CHUNK_DIM * chunk.y;
                        let bz = SLICE[ptr_z] + CHUNK_DIM * chunk.z;
                        RenderBlock.Side(CHUNK_MESH, side, bx, by, bz, texture[0], texture[1], texture[2], texture[3]);
                    }   
                }   
            }
            chunk.begin_side[side] = mesh_begin_index * 4;
            chunk.count_side[side] = CHUNK_MESH.index_pos - mesh_begin_index;
        }
        chunk.mesh = RenderBuffer.InitCopy(gl, CHUNK_MESH);
    }
}