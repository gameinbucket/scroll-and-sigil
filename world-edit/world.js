const WORLD_POSITIVE_X = 0;
const WORLD_POSITIVE_Y = 1;
const WORLD_POSITIVE_Z = 2;
const WORLD_NEGATIVE_X = 3;
const WORLD_NEGATIVE_Y = 4;
const WORLD_NEGATIVE_Z = 5;
class World {
    constructor(chunk_w, chunk_h, chunk_l) {
        this.chunk_w = chunk_w;
        this.chunk_h = chunk_h;
        this.chunk_l = chunk_l;
        this.chunk_slice = chunk_w * chunk_h;
        this.chunk_all = chunk_w * chunk_h * chunk_l;
        this.chunks = [];
        this.colors = [[]];

        // this.grid = [];

        this.collisions = new Set();
        this.chunk_cache = [];
        this.chunk_cache_count = 0;
    }
    init() {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < this.chunk_all; i++) {
            let ch = new Chunk();
            ch.init(x, y, z);
            this.chunks[i] = ch;
            x++;
            if (x == this.chunk_w) {
                x = 0;
                y++;
                if (y == this.chunk_h) {
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
    mesh(g, gl) {
        for (let i = 0; i < this.chunk_all; i++) {
            this.chunks[i].mesh(this, g, gl);
        }
    }
    render(gl, sprite_buffers, x, y, z, xx, zz, sin, cos) {
        for (let i = 0; i < this.chunk_all; i++) {
            let chunk = this.chunks[i];
            let mesh = chunk.mesh;
            if (mesh.vertex_pos == 0) {
                continue;
            }
            RenderSystem.BindVao(gl, mesh);

            if (x == chunk.x) {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_POSITIVE_X], chunk.count_side[WORLD_POSITIVE_X]);
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_NEGATIVE_X], chunk.count_side[WORLD_NEGATIVE_X]);
            }
            else if (x > chunk.x) {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_POSITIVE_X], chunk.count_side[WORLD_POSITIVE_X]);
            }
            else {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_NEGATIVE_X], chunk.count_side[WORLD_NEGATIVE_X]);
            }
            
            if (y == chunk.y) {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_POSITIVE_Y], chunk.count_side[WORLD_POSITIVE_Y]);
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_NEGATIVE_Y], chunk.count_side[WORLD_NEGATIVE_Y]);
            }
            else if (y > chunk.y) {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_POSITIVE_Y], chunk.count_side[WORLD_POSITIVE_Y]);
            }
            else {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_NEGATIVE_Y], chunk.count_side[WORLD_NEGATIVE_Y]);
            }

            if (z == chunk.z) {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_POSITIVE_Z], chunk.count_side[WORLD_POSITIVE_Z]);
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_NEGATIVE_Z], chunk.count_side[WORLD_NEGATIVE_Z]);
            }
            else if (z > chunk.z) {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_POSITIVE_Z], chunk.count_side[WORLD_POSITIVE_Z]);
            }
            else {
                RenderSystem.DrawRange(gl, chunk.begin_side[WORLD_NEGATIVE_Z], chunk.count_side[WORLD_NEGATIVE_Z]);
            }

            chunk.render_things(gl, sprite_buffers, xx, zz, sin, cos);
        }
    }
    add_chunk_cache(c) {
        if (this.chunk_cache_count === this.chunk_cache.length) {
            let cp = new Array(this.chunk_cache_count + 10);
            for (let i = 0; i < this.chunk_cache_count; i++) {
                cp[i] = this.chunk_cache[i];
            }    
            this.chunk_cache = cp;
        }
        this.chunk_cache[this.chunk_cache_count] = c;
        this.chunk_cache_count++;
    }
    remove_chunk_cache(c) {
        for (let i = 0; i < this.chunk_cache_count; i++) {
            if (this.chunk_cache[i] === c) {
                for (let j = i; j < this.chunk_cache_count - 1; j++) {
                    this.chunk_cache[j] = this.chunk_cache[j + 1];
                }
                this.chunk_cache_count--;
                break;
            }
        }
    }
    update() {
        // ... unit vision

        this.collisions.clear();

        for (let i = 0; i < this.chunk_cache_count; i++) {
            let c = this.chunk_cache[i];
            for (let j = 0; j < c.physical_count; j++) {
                let a = c.physical[j];
                for (let k = j + 1; k < c.physical_count; k++) {
                    let b = c.physical[k];
                    let id = Math.floor(a.x) + ' ' + Math.floor(a.y) + ' ' + Math.floor(a.z) + ' ' + Math.floor(b.x) + ' ' + Math.floor(b.y) + ' ' + Math.floor(b.z);
                    if (!this.collisions.has(id)) {
                        this.collisions.add(id);
                        this.unit_overlap(a, b);
                    }
                }
            }
        }

        for (let i = 0; i < this.colors.length; i++) {
            let c =  this.colors[i];
            for (let j = 0; j < c.length; j++) {
                c[j].update();
            }
        }

        // ... remove dead units
    }
    unit_overlap(a, b) {
        let dxx = a.x - b.x;
        let dzz = a.z - b.z;
        let repel = a.radius + b.radius;
        let distance = dxx * dxx + dzz * dzz;
        if (distance > repel * repel) {
            return;
        }
        distance = Math.sqrt(distance);
        if (distance === 0) {
            distance = 0.0001;
        }
        repel /= distance;
        let fx = dxx * repel - dxx;
        let fz = dzz * repel - dzz;
        a.dx += fx;
        a.dz += fz;
        b.dx -= fx;
        b.dz -= fz;
    }
}