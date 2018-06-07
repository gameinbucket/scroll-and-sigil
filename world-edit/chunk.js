const CHUNK_DIM = 8;
const CHUNK_SLICE = CHUNK_DIM * CHUNK_DIM;
const CHUNK_ALL = CHUNK_SLICE * CHUNK_DIM;
const CHUNK_MESH = new RenderCopy(3, 3, 2, CHUNK_ALL * 6 * 4, CHUNK_ALL * 6 * 6);
const CHUNK_MESH_AMBIENT = new Array(CHUNK_ALL);
for (let i = 0; i < CHUNK_ALL; i++) {
    CHUNK_MESH_AMBIENT[i] = new Array(6);
    for (let j = 0; j < 6; j++) {
        CHUNK_MESH_AMBIENT[i][j] = new Uint8Array(4);
    }
}
const CHUNK_COLOR_DIM = CHUNK_DIM + 1;
const CHUNK_COLOR_SLICE = CHUNK_COLOR_DIM * CHUNK_COLOR_DIM;
const CHUNK_MESH_COLOR = new Array(CHUNK_COLOR_DIM * CHUNK_COLOR_SLICE);
for (let i = 0; i < CHUNK_MESH_COLOR.length; i++) {
    CHUNK_MESH_COLOR[i] = new Uint8Array(3);
}
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
            if (px === 3 && pz === 3 && py === 1) {
                type = BLOCK_STONE;
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
    get_block_pointer_unsafe(x, y, z) {
        return this.blocks[x + y * CHUNK_DIM + z * CHUNK_SLICE];
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
    ambient_mesh(world) {
        for (let bz = 0; bz < CHUNK_DIM; bz++) {
            for (let by = 0; by < CHUNK_DIM; by++) {
                for (let bx = 0; bx < CHUNK_DIM; bx++) {
                    let index = bx + by * CHUNK_DIM + bz * CHUNK_SLICE;
                    if (this.blocks[index].type === BLOCK_NONE) {
                        continue;
                    }
                    let ao_mmz = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by - 1, bz));
                    let ao_mmm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by - 1, bz - 1));
                    let ao_mmp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by - 1, bz + 1));
                    let ao_mzp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by, bz + 1));
                    let ao_mzm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by, bz - 1));
                    let ao_mpz = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by + 1, bz));
                    let ao_mpp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by + 1, bz + 1));
                    let ao_mpm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx - 1, by + 1, bz - 1));
                    let ao_zpp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx, by + 1, bz + 1));
                    let ao_zmp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx, by - 1, bz + 1));
                    let ao_zpm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx, by + 1, bz - 1));
                    let ao_zmm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx, by - 1, bz - 1));
                    let ao_ppz = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by + 1, bz));
                    let ao_pmz = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by - 1, bz));
                    let ao_pzp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by, bz + 1));
                    let ao_pzm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by, bz - 1));
                    let ao_pmm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by - 1, bz - 1));
                    let ao_ppm = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by + 1, bz - 1));
                    let ao_ppp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by + 1, bz + 1));
                    let ao_pmp = Block.Closed(world.get_block_type(this.x, this.y, this.z, bx + 1, by - 1, bz + 1));
                    
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][0] = Block.Ambient(ao_pmz, ao_pzm, ao_pmm);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][1] = Block.Ambient(ao_ppz, ao_pzm, ao_ppm);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][2] = Block.Ambient(ao_ppz, ao_pzp, ao_ppp);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][3] = Block.Ambient(ao_pmz, ao_pzp, ao_pmp);
                    
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][0] = Block.Ambient(ao_mmz, ao_mzm, ao_mmm);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][1] = Block.Ambient(ao_mmz, ao_mzp, ao_mmp);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][2] = Block.Ambient(ao_mpz, ao_mzp, ao_mpp);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][3] = Block.Ambient(ao_mpz, ao_mzm, ao_mpm);
                    
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][0] = Block.Ambient(ao_mpz, ao_zpm, ao_mpm);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][1] = Block.Ambient(ao_mpz, ao_zpp, ao_mpp);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][2] = Block.Ambient(ao_ppz, ao_zpp, ao_ppp);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][3] = Block.Ambient(ao_ppz, ao_zpm, ao_ppm);
                    
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][0] = Block.Ambient(ao_mmz, ao_zmm, ao_mmm);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][1] = Block.Ambient(ao_pmz, ao_zmm, ao_pmm);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][2] = Block.Ambient(ao_pmz, ao_zmp, ao_pmp);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][3] = Block.Ambient(ao_mmz, ao_zmp, ao_mmp);
                    
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][0] = Block.Ambient(ao_pzp, ao_zmp, ao_pmp);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][1] = Block.Ambient(ao_pzp, ao_zpp, ao_ppp);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][2] = Block.Ambient(ao_mzp, ao_zpp, ao_mpp);
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][3] = Block.Ambient(ao_mzp, ao_zmp, ao_mmp);
                    
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][0] = Block.Ambient(ao_mzm, ao_zmm, ao_mmm);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][1] = Block.Ambient(ao_mzm, ao_zpm, ao_mpm);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][2] = Block.Ambient(ao_pzm, ao_zpm, ao_ppm);
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][3] = Block.Ambient(ao_pzm, ao_zmm, ao_pmm);
                }
            }
        }
    }
    color_mesh(world) {
        for (let bz = 0; bz < CHUNK_COLOR_DIM; bz++) {
            for (let by = 0; by < CHUNK_COLOR_DIM; by++) {
                for (let bx = 0; bx < CHUNK_COLOR_DIM; bx++) {
                    let color = [0, 0, 0, 0];

                    let block_zzz = world.get_block_pointer(this.x, this.y, this.z, bx, by, bz)
                    let block_mzz = world.get_block_pointer(this.x, this.y, this.z, bx - 1, by, bz)
                    let block_mzm = world.get_block_pointer(this.x, this.y, this.z, bx - 1, by, bz - 1)
                    let block_zzm = world.get_block_pointer(this.x, this.y, this.z, bx, by, bz - 1)
                    let block_zmz = world.get_block_pointer(this.x, this.y, this.z, bx, by - 1, bz)
                    let block_mmz = world.get_block_pointer(this.x, this.y, this.z, bx - 1, by - 1, bz)
                    let block_mmm = world.get_block_pointer(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)
                    let block_zmm = world.get_block_pointer(this.x, this.y, this.z, bx, by - 1, bz - 1)

                    if (Block.PointerClosed(block_zzz)) {
                        this.determine_light(block_mzz, color);
                        this.determine_light(block_zmz, color);
                        this.determine_light(block_zzm, color);
                    }
                    if (Block.PointerClosed(block_mzz)) {
                        this.determine_light(block_zzz, color);
                        this.determine_light(block_zmz, color);
                        this.determine_light(block_zzm, color);
                    }
                    if (Block.PointerClosed(block_mzm)) {
                        this.determine_light(block_mzz, color);
                        this.determine_light(block_zzm, color);
                        this.determine_light(block_mmm, color);
                    }
                    if (Block.PointerClosed(block_zzm)) {
                        this.determine_light(block_zzz, color);
                        this.determine_light(block_mzm, color);
                        this.determine_light(block_zmm, color);
                    }
                    if (Block.PointerClosed(block_zmz)) {
                        this.determine_light(block_zzz, color);
                        this.determine_light(block_mmz, color);
                        this.determine_light(block_zmm, color);
                    }
                    if (Block.PointerClosed(block_mmz)) {
                        this.determine_light(block_mzz, color);
                        this.determine_light(block_mmm, color);
                        this.determine_light(block_zmz, color);
                    }
                    if (Block.PointerClosed(block_mmm)) {
                        this.determine_light(block_mzm, color);
                        this.determine_light(block_zmm, color);
                        this.determine_light(block_mmz, color);
                    }
                    if (Block.PointerClosed(block_zmm)) {
                        this.determine_light(block_zzm, color);
                        this.determine_light(block_zmz, color);
                        this.determine_light(block_mmm, color);
                    }

                    let index = bx + by * CHUNK_COLOR_DIM + bz * CHUNK_COLOR_SLICE;
                    if (color[3] > 0) {
                        CHUNK_MESH_COLOR[index][0] = color[0] / color[3];
                        CHUNK_MESH_COLOR[index][1] = color[1] / color[3];
                        CHUNK_MESH_COLOR[index][2] = color[2] / color[3];
                    } else {
                        CHUNK_MESH_COLOR[index] = 0;
                    }
                }
            }
        }
    }
    determine_light(block, color) {
        if (block === null) {
            return;
        }
        if (!Block.Closed(block.type)) {
            color[0] += block.red;
            color[1] += block.green;
            color[2] += block.blue;
            color[3]++;
        }
    }
    light_of_side(xs, ys, zs, side) {
        switch (side) {
        case WORLD_POSITIVE_X:
            return meshColor[xs+1+ys*meshColorSize+zs*meshColorSlice],
                meshColor[xs+1+(ys+1)*meshColorSize+zs*meshColorSlice],
                meshColor[xs+1+(ys+1)*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+1+ys*meshColorSize+(zs+1)*meshColorSlice];
        case WORLD_NEGATIVE_X:
            return meshColor[xs+ys*meshColorSize+zs*meshColorSlice],
                meshColor[xs+ys*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+(ys+1)*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+(ys+1)*meshColorSize+zs*meshColorSlice];
        case WORLD_POSITIVE_Y:
            return meshColor[xs+(ys+1)*meshColorSize+zs*meshColorSlice],
                meshColor[xs+(ys+1)*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+1+(ys+1)*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+1+(ys+1)*meshColorSize+zs*meshColorSlice];
        case WORLD_NEGATIVE_Y:
            return meshColor[xs+ys*meshColorSize+zs*meshColorSlice],
                meshColor[xs+1+ys*meshColorSize+zs*meshColorSlice],
                meshColor[xs+1+ys*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+ys*meshColorSize+(zs+1)*meshColorSlice];
        case WORLD_POSITIVE_Z:
            return meshColor[xs+1+ys*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+1+(ys+1)*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+(ys+1)*meshColorSize+(zs+1)*meshColorSlice],
                meshColor[xs+ys*meshColorSize+(zs+1)*meshColorSlice];
        default:
            return meshColor[xs+ys*meshColorSize+zs*meshColorSlice],
                meshColor[xs+(ys+1)*meshColorSize+zs*meshColorSlice],
                meshColor[xs+1+(ys+1)*meshColorSize+zs*meshColorSlice],
                meshColor[xs+1+ys*meshColorSize+zs*meshColorSlice];
        }
    }
    mesh(world, g, gl) {
        this.ambient_mesh(world);
        this.color_mesh(world);
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

                        /* TODO: heightmap ambient light
                        let nx = raise_a[0] - raise_b[1];
                        let ny = raise_b[0] - raise_c[1]; 
                        let nz = raise_c[0] - raise_d[1];
                        let nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
                        
                        nx /= nl;
                        ny /= nl;
                        nz /= nl;

                        let world_normal_x = 0.0;
                        let world_normal_y = 1.0;
                        let world_normal_z = 0.0;
                        let light_intensity = 1.0;
                        let light_ambience = 0.5;

                        let light = (-world_normal_x * nx + -world_normal_y * ny + -world_normal_z * nz) * light_intensity;
                        
                        if (light > 1.0) {
                            light = 1.0;
                        } else if (light < 0.0) {
                            light = 0.0;
                        }

                        light = Math.max(light, light_ambience); */

                        // TODO light0, light1, light2, light3 := lightOfSide(xs, ys, zs, side)
                        
                        let index = SLICE[ptr_x] + SLICE[ptr_y] * CHUNK_DIM + SLICE[ptr_z] * CHUNK_SLICE;

                        let ambient = CHUNK_MESH_AMBIENT[index][side];
                        let ambient_a = ambient[0] / 255.0;
                        let ambient_b = ambient[1] / 255.0;
                        let ambient_c = ambient[2] / 255.0;
                        let ambient_d = ambient[3] / 255.0;

                        let rgb_a = [ambient_a, ambient_a, ambient_a];
                        let rgb_b = [ambient_b, ambient_b, ambient_b];
                        let rgb_c = [ambient_c, ambient_c, ambient_c];
                        let rgb_d = [ambient_d, ambient_d, ambient_d];

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