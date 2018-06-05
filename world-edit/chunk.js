const CHUNK_DIM = 8;
const CHUNK_SLICE = CHUNK_DIM * CHUNK_DIM;
const CHUNK_ALL = CHUNK_SLICE * CHUNK_DIM;
const CHUNK_MESH = new RenderCopy(3, 3, 2, CHUNK_ALL * 6 * 4, CHUNK_ALL * 6 * 6);
const SLICE_X = [2, 1, 0, 2, 1, 0];
const SLICE_Y = [0, 2, 1, 0, 2, 1];
const SLICE_Z = [1, 0, 2, 1, 0, 2];
const SLICE_TOWARDS = [1, 1, 1, -1, -1, -1];
const SLICE = new Array(3);
const SLICE_TEMP = new Array(3);
class Chunk {
    constructor(g, gl) {
        this.blocks = [];
        this.terrain_offset = [];
        this.mesh;
        this.begin_side = new Array(6);
        this.count_side = new Array(6);
        this.x;
        this.y;
        this.z;
        this.units = [];
        this.unit_count = 0;
        this.physical = [];
        this.physical_count = 0;
    }
    init(px, py, pz) {
        this.x = px;
        this.y = py;
        this.z = pz;
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < CHUNK_ALL; i++) {
            let type = Math.random() > 0.5 ? BLOCK_GRASS : BLOCK_STONE;
            if (py > 0 && px !== 0 && pz !== 0) {
                type = BLOCK_NONE;
            }
            let block = new Block(type, [Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5]);
            this.blocks[i] = block;
            x++;
            if (x == CHUNK_DIM) {
                x = 0;
                y++;
                if (y == CHUNK_DIM) {
                    y = 0;
                    z++;
                }
            }
        }
    }
    get_block_type_unsafe(x, y, z) {
        return this.blocks[x + y * CHUNK_DIM + z * CHUNK_SLICE].type;
    }
    get_block_raise_unsafe(x, y, z) {
        return this.blocks[x + y * CHUNK_DIM + z * CHUNK_SLICE].raise;
    }
    add_unit(u) {
        if (this.unit_count === this.units.length) {
            let cp = new Array(this.unit_count + 5);
            for (let i = 0; i < this.unit_count; i++) {
                cp[i] = this.units[i];
            }    
            this.units = cp;
        }
        this.units[this.unit_count] = u;
        this.unit_count++;
    }
    remove_unit(u) {
        for (let i = 0; i < this.unit_count; i++) {
            if (this.units[i] === u) {
                for (let j = i; j < this.unit_count - 1; j++) {
                    this.units[j] = this.units[j + 1];
                }
                this.unit_count--;
                break;
            }
        }
    }
    add_physical(world, p) {
        if (this.physical_count === this.physical.length) {
            let cp = new Array(this.physical_count + 5);
            for (let i = 0; i < this.physical_count; i++) {
                cp[i] = this.physical[i];
            }    
            this.physical = cp;
        }
        this.physical[this.physical_count] = p;
        this.physical_count++;

        if (this.physical_count === 2) {
            world.add_chunk_cache(this);
        }
    }
    remove_physical(world, p) {
        for (let i = 0; i < this.physical_count; i++) {
            if (this.physical[i] === p) {
                for (let j = i; j < this.physical_count - 1; j++) {
                    this.physical[j] = this.physical[j + 1];
                }
                this.physical_count--;
                if (this.physical_count === 1) {
                    world.remove_chunk_cache(this);
                }
                break;
            }
        }
    }
    mesh(world, g, gl) {
        CHUNK_MESH.zero();
        for (let side = 0; side < 6; side++) {
            let mesh_begin_index = CHUNK_MESH.index_pos;
            let ptr_x = SLICE_X[side];
		    let ptr_y = SLICE_Y[side];
		    let ptr_z = SLICE_Z[side];
		    let toward = SLICE_TOWARDS[side];
            for (SLICE[2] = 0; SLICE[2] < CHUNK_DIM; SLICE[2]++) {
                for (SLICE[1] = 0; SLICE[1] < CHUNK_DIM; SLICE[1]++) {
                    for (SLICE[0] = 0; SLICE[0] < CHUNK_DIM; SLICE[0]++) {
                        let type = this.get_block_type_unsafe(SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z]);
                        if (type === BLOCK_NONE) {
                            continue;
                        }
                        SLICE_TEMP[0] = SLICE[0];
                        SLICE_TEMP[1] = SLICE[1];
                        SLICE_TEMP[2] = SLICE[2] + toward;
                        if (Block.Closed(world.get_block_type(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z]))) {
                            continue;
                        }
                        let texture = Block.Texture(type);
                        let bx = SLICE[ptr_x] + CHUNK_DIM * this.x;
                        let by = SLICE[ptr_y] + CHUNK_DIM * this.y;
                        let bz = SLICE[ptr_z] + CHUNK_DIM * this.z;
                        
                        let raise_a = world.get_block_raise(this.x, this.y, this.z, SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z]);
                        
                        SLICE_TEMP[0] = SLICE[0] + 1;
                        SLICE_TEMP[1] = SLICE[1];
                        SLICE_TEMP[2] = SLICE[2];
                        let raise_b = world.get_block_raise(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z]);
                        
                        SLICE_TEMP[0] = SLICE[0];
                        SLICE_TEMP[1] = SLICE[1] + 1;
                        SLICE_TEMP[2] = SLICE[2];
                        let raise_c = world.get_block_raise(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z]);

                        SLICE_TEMP[0] = SLICE[0] + 1;
                        SLICE_TEMP[1] = SLICE[1] + 1;
                        SLICE_TEMP[2] = SLICE[2];
                        let raise_d = world.get_block_raise(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z]);

                        let rgb_a = [1.0 - raise_a[1], 1.0 - raise_a[1], 1.0 - raise_a[1]];
                        let rgb_b = [1.0 - raise_b[1], 1.0 - raise_b[1], 1.0 - raise_b[1]];
                        let rgb_c = [1.0, 1.0, 1.0];
                        let rgb_d = [1.0, 1.0, 1.0];

                        RenderBlock.Side(CHUNK_MESH, side, bx, by, bz, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d);
                    }   
                }   
            }
            this.begin_side[side] = mesh_begin_index * 4;
            this.count_side[side] = CHUNK_MESH.index_pos - mesh_begin_index;
        }
        this.mesh = RenderBuffer.InitCopy(gl, CHUNK_MESH);
    }
    render_things(gl, sprite_buffers, mv) {
        for (let i = 0; i < this.unit_count; i++) {
            let u = this.units[i];
            let s = u.animation[u.animation_frame][u.direction];
            if (u.mirror) {
                Render.MirrorSprite(sprite_buffers[u.sprite_id], u.x, u.y + s.height, u.z, mv, s);
            } else {
                Render.Sprite(sprite_buffers[u.sprite_id], u.x, u.y + s.height, u.z, mv, s);
            }
        }
    }
}