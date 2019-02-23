const WORLD_POSITIVE_X = 0
const WORLD_POSITIVE_Y = 1
const WORLD_POSITIVE_Z = 2
const WORLD_NEGATIVE_X = 3
const WORLD_NEGATIVE_Y = 4
const WORLD_NEGATIVE_Z = 5
const WORLD_LIGHT_AMBIENT = 0.38
const WORLD_LIGHT_INTESITY = 5.0
const WORLD_LIGHT_DIR_X = 50.0
const WORLD_LIGHT_DIR_Y = -10.0
const WORLD_LIGHT_DIR_Z = 50.0
const WORLD_LIGHT_LEN = Math.sqrt(
    WORLD_LIGHT_DIR_X * WORLD_LIGHT_DIR_X +
    WORLD_LIGHT_DIR_Y * WORLD_LIGHT_DIR_Y +
    WORLD_LIGHT_DIR_Z * WORLD_LIGHT_DIR_Z)
const WORLD_LIGHT_X = WORLD_LIGHT_DIR_X / WORLD_LIGHT_LEN
const WORLD_LIGHT_Y = WORLD_LIGHT_DIR_Y / WORLD_LIGHT_LEN
const WORLD_LIGHT_Z = WORLD_LIGHT_DIR_Z / WORLD_LIGHT_LEN

class World {
    constructor(g, gl) {
        this.g = g
        this.gl = gl
        this.block_w
        this.block_h
        this.block_l
        this.block_slice
        this.block_all
        this.blocks
        this.colors
        this.viewable
        this.collisions
        this.block_cache
        this.block_cache_count
    }
    load(data) {
        let content
        try {
            content = JSON.parse(data)
        } catch (err) {
            console.log("Failed to parse world", data)
            return
        }

        this.blocks = []
        this.colors = [
            []
        ]
        this.viewable = []
        this.collisions = new Set()
        this.block_cache = []
        this.block_cache_count = 0

        let blocks = content["blocks"]

        let left = null
        let right = null
        let top = null
        let bottom = null
        let front = null
        let back = null
        for (let b = 0; b < blocks.length; b++) {
            let block = blocks[b]
            let bx = block["x"]
            let by = block["y"]
            let bz = block["z"]

            if (left === null || bx < left) left = bx
            if (right === null || bx > right) right = bx
            if (top === null || by > top) top = by
            if (bottom === null || by < bottom) bottom = by
            if (front === null || bz > front) front = bz
            if (back === null || bz < back) back = bz
        }

        this.width = right - left + 1
        this.height = top - bottom + 1
        this.length = front - back + 1
        this.slice = this.width * this.height
        this.all = this.slice * this.length

        this.block_w = this.width
        this.block_h = this.height
        this.block_l = this.length
        this.block_slice = this.slice
        this.block_all = this.all

        for (let b = 0; b < blocks.length; b++) {
            let data = blocks[b]
            let bx = data["x"] - left
            let by = data["y"] - bottom
            let bz = data["z"] - back
            let tiles = data["tiles"]

            let block = new Block(bx, by, bz)

            for (let t = 0; t < CHUNK_ALL; t++)
                block.tiles[t].type = tiles[t]

            this.blocks[bx + by * this.width + bz * this.slice] = block
        }

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.length; z++) {
                    let i = x + y * this.width + z * this.slice
                    if (this.blocks[i] === null || this.blocks[i] === undefined)
                        this.blocks[i] = new Block(x, y, z)
                }
            }
        }

        for (let b = 0; b < blocks.length; b++) {
            let data = blocks[b]
            let bx = data["x"] - left
            let by = data["y"] - bottom
            let bz = data["z"] - bottom
            let things = data["things"]

            let px = bx * GRID_SIZE
            let py = by * GRID_SIZE
            let pz = bz * GRID_SIZE

            for (let t = 0; t < things.length; t++) {
                let thing = things[t]
                let id = thing["id"]
                let x = thing["x"] + px
                let y = thing["y"] + py
                let z = thing["z"] + pz
                let item = THING_MAP[id]
                if (id === "you") {
                    if (you === null)
                        you = item.get(this, x, y)
                } else
                    item.get(this, x, y)
            }
        }

        this.build()
        console.log(this.save("map"))
    }
    save(name) {
        let data = `{"name":"${name}","blocks":[`
        let block_data = []
        for (let i = 0; i < this.block_all; i++) {
            let block = this.blocks[i]
            if (block.empty()) continue
            block_data.push(block.save())
        }
        data += block_data.join(",")
        data += "]}"
        return data
    }
    build() {
        for (let i = 0; i < this.block_all; i++) {
            let block = this.blocks[i]
            for (let j = 0; j < block.lights.length; j++)
                Light.Add(this, block, block.lights[j])
            Occlusion.Calculate(block)
        }
        for (let i = 0; i < this.block_all; i++)
            this.blocks[i].build_mesh(this, this.g, this.gl)
    }
    find_block(x, y, z) {
        let cx = Math.floor(x / CHUNK_DIM)
        let cy = Math.floor(y / CHUNK_DIM)
        let cz = Math.floor(z / CHUNK_DIM)
        let bx = x % CHUNK_DIM
        let by = y % CHUNK_DIM
        let bz = z % CHUNK_DIM
        let block = this.blocks[cx + cy * this.block_w + cz * this.block_slice]
        return block.tiles[bx + by * CHUNK_DIM + bz * CHUNK_SLICE].type
    }
    get_tile_pointer(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += CHUNK_DIM
            cx--
        }
        while (bx >= CHUNK_DIM) {
            bx -= CHUNK_DIM
            cx++
        }
        while (by < 0) {
            by += CHUNK_DIM
            cy--
        }
        while (by >= CHUNK_DIM) {
            by -= CHUNK_DIM
            cy++
        }
        while (bz < 0) {
            bz += CHUNK_DIM
            cz--
        }
        while (bz >= CHUNK_DIM) {
            bz -= CHUNK_DIM
            cz++
        }
        let block = this.get_block(cx, cy, cz)
        if (block === null) {
            return null
        }
        return block.get_tile_pointer_unsafe(bx, by, bz)
    }
    get_tile_type(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += CHUNK_DIM
            cx--
        }
        while (bx >= CHUNK_DIM) {
            bx -= CHUNK_DIM
            cx++
        }
        while (by < 0) {
            by += CHUNK_DIM
            cy--
        }
        while (by >= CHUNK_DIM) {
            by -= CHUNK_DIM
            cy++
        }
        while (bz < 0) {
            bz += CHUNK_DIM
            cz--
        }
        while (bz >= CHUNK_DIM) {
            bz -= CHUNK_DIM
            cz++
        }
        let block = this.get_block(cx, cy, cz)
        if (block === null) {
            return BLOCK_NONE
        }
        return block.get_tile_type_unsafe(bx, by, bz)
    }
    get_block(x, y, z) {
        if (x < 0 || x >= this.block_w) {
            return null
        }
        if (y < 0 || y >= this.block_h) {
            return null
        }
        if (z < 0 || z >= this.block_l) {
            return null
        }
        return this.blocks[x + y * this.block_w + z * this.block_slice]
    }
    add_block_cache(c) {
        if (this.block_cache_count === this.block_cache.length) {
            let cp = new Array(this.block_cache_count + 10)
            for (let i = 0; i < this.block_cache_count; i++) {
                cp[i] = this.block_cache[i]
            }
            this.block_cache = cp
        }
        this.block_cache[this.block_cache_count] = c
        this.block_cache_count++
    }
    remove_block_cache(c) {
        for (let i = 0; i < this.block_cache_count; i++) {
            if (this.block_cache[i] === c) {
                for (let j = i; j < this.block_cache_count - 1; j++) {
                    this.block_cache[j] = this.block_cache[j + 1]
                }
                this.block_cache_count--
                break
            }
        }
    }
    get_terrain_height(x, y, z) {
        let gy = Math.floor(y)
        return gy + 1
    }
    unit_overlap(a, b) {
        let dxx = a.x - b.x
        let dzz = a.z - b.z
        let repel = a.radius + b.radius
        let distance = dxx * dxx + dzz * dzz
        if (distance > repel * repel) {
            return
        }
        distance = Math.sqrt(distance)
        if (distance === 0) {
            distance = 0.0001
        }
        repel /= distance
        let fx = dxx * repel - dxx
        let fz = dzz * repel - dzz
        a.dx += fx
        a.dz += fz
        b.dx -= fx
        b.dz -= fz
    }
    update() {
        this.collisions.clear()

        for (let i = 0; i < this.block_cache_count; i++) {
            let c = this.block_cache[i]
            for (let j = 0; j < c.physical_count; j++) {
                let a = c.physical[j]
                for (let k = j + 1; k < c.physical_count; k++) {
                    let b = c.physical[k]
                    let id = Math.floor(a.x) + " " + Math.floor(a.y) + " " + Math.floor(a.z) + " " + Math.floor(b.x) + " " + Math.floor(b.y) + " " + Math.floor(b.z)
                    if (!this.collisions.has(id)) {
                        this.collisions.add(id)
                        this.unit_overlap(a, b)
                    }
                }
            }
        }

        for (let i = 0; i < this.colors.length; i++) {
            let c = this.colors[i]
            for (let j = 0; j < c.length; j++) {
                c[j].update(this)
            }
        }
    }
    render(gl, sprite_buffers, x, y, z, mv) {
        for (let i = 0; i < OCCLUSION_VIEW_NUM; i++) {
            let block = this.viewable[i]

            block.render_things(gl, sprite_buffers, mv)

            let mesh = block.mesh
            if (mesh.vertex_pos === 0)
                continue

            RenderSystem.BindVao(gl, mesh)

            if (x == block.x) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_X], block.count_side[WORLD_POSITIVE_X])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_X], block.count_side[WORLD_NEGATIVE_X])
            } else if (x > block.x) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_X], block.count_side[WORLD_POSITIVE_X])
            } else {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_X], block.count_side[WORLD_NEGATIVE_X])
            }

            if (y == block.y) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Y], block.count_side[WORLD_POSITIVE_Y])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Y], block.count_side[WORLD_NEGATIVE_Y])
            } else if (y > block.y) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Y], block.count_side[WORLD_POSITIVE_Y])
            } else {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Y], block.count_side[WORLD_NEGATIVE_Y])
            }

            if (z == block.z) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Z], block.count_side[WORLD_POSITIVE_Z])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Z], block.count_side[WORLD_NEGATIVE_Z])
            } else if (z > block.z) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Z], block.count_side[WORLD_POSITIVE_Z])
            } else {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Z], block.count_side[WORLD_NEGATIVE_Z])
            }
        }
    }
}
