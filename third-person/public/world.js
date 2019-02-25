const WORLD_POSITIVE_X = 0
const WORLD_POSITIVE_Y = 1
const WORLD_POSITIVE_Z = 2
const WORLD_NEGATIVE_X = 3
const WORLD_NEGATIVE_Y = 4
const WORLD_NEGATIVE_Z = 5

class World {
    constructor(g, gl) {
        this.g = g
        this.gl = gl
        this.width
        this.height
        this.length
        this.slice
        this.all
        this.blocks
        this.viewable
        this.block_cache
        this.block_cache_count
        this.sprite_set
        this.sprite_buffer
        this.sprite_count
        this.things
        this.thing_count
        this.threads = ["ai", "pathing"]
        this.thread_index = 0
        this.thread_id = ""
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
        this.viewable = []
        this.block_cache = []
        this.block_cache_count = 0
        this.sprite_set = new Set()
        this.sprite_buffer = {}
        this.sprite_count = {}
        this.things = []
        this.thing_count = 0

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

        for (let b = 0; b < blocks.length; b++) {
            let data = blocks[b]
            let bx = data["x"] - left
            let by = data["y"] - bottom
            let bz = data["z"] - back
            let tiles = data["tiles"]

            let block = new Block(bx, by, bz)

            if (tiles !== null) {
                for (let t = 0; t < BLOCK_ALL; t++)
                    block.tiles[t].type = tiles[t]
            }

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

            let px = bx * BLOCK_SIZE
            let py = by * BLOCK_SIZE
            let pz = bz * BLOCK_SIZE

            for (let t = 0; t < things.length; t++) {
                let thing = things[t]
                let id = thing["id"]
                let x = thing["x"] + px
                let y = thing["y"] + py
                let z = thing["z"] + pz
                THING_MAP[id].make(this, x, y, z)
            }
        }

        this.build()
    }
    save(name) {
        let data = `{"name":"${name}","blocks":[`
        let block_data = []
        for (let i = 0; i < this.all; i++) {
            let block = this.blocks[i]
            if (block.empty()) continue
            block_data.push(block.save())
        }
        data += block_data.join(",")
        data += "]}"
        return data
    }
    build() {
        for (let i = 0; i < this.all; i++) {
            let block = this.blocks[i]
            for (let j = 0; j < block.lights.length; j++)
                Light.Add(this, block, block.lights[j])
            Occlusion.Calculate(block)
        }
        for (let i = 0; i < this.all; i++)
            this.blocks[i].build_mesh(this)
    }
    find_block(x, y, z) {
        let cx = Math.floor(x * INV_BLOCK_SIZE)
        let cy = Math.floor(y * INV_BLOCK_SIZE)
        let cz = Math.floor(z * INV_BLOCK_SIZE)
        let bx = x % BLOCK_SIZE
        let by = y % BLOCK_SIZE
        let bz = z % BLOCK_SIZE
        let block = this.blocks[cx + cy * this.width + cz * this.slice]
        return block.tiles[bx + by * BLOCK_SIZE + bz * BLOCK_SLICE].type
    }
    get_tile_pointer(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BLOCK_SIZE
            cx--
        }
        while (bx >= BLOCK_SIZE) {
            bx -= BLOCK_SIZE
            cx++
        }
        while (by < 0) {
            by += BLOCK_SIZE
            cy--
        }
        while (by >= BLOCK_SIZE) {
            by -= BLOCK_SIZE
            cy++
        }
        while (bz < 0) {
            bz += BLOCK_SIZE
            cz--
        }
        while (bz >= BLOCK_SIZE) {
            bz -= BLOCK_SIZE
            cz++
        }
        let block = this.get_block(cx, cy, cz)
        if (block === null)
            return null
        return block.get_tile_pointer_unsafe(bx, by, bz)
    }
    get_tile_type(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BLOCK_SIZE
            cx--
        }
        while (bx >= BLOCK_SIZE) {
            bx -= BLOCK_SIZE
            cx++
        }
        while (by < 0) {
            by += BLOCK_SIZE
            cy--
        }
        while (by >= BLOCK_SIZE) {
            by -= BLOCK_SIZE
            cy++
        }
        while (bz < 0) {
            bz += BLOCK_SIZE
            cz--
        }
        while (bz >= BLOCK_SIZE) {
            bz -= BLOCK_SIZE
            cz++
        }
        let block = this.get_block(cx, cy, cz)
        if (block === null) {
            return TILE_NONE
        }
        return block.get_tile_type_unsafe(bx, by, bz)
    }
    get_block(x, y, z) {
        if (x < 0 || x >= this.width)
            return null
        if (y < 0 || y >= this.height)
            return null
        if (z < 0 || z >= this.length)
            return null
        return this.blocks[x + y * this.width + z * this.slice]
    }
    add_thing(thing) {
        this.things[this.thing_count] = thing
        this.thing_count++

        let count = this.sprite_count[thing.sid]
        if (count) {
            this.sprite_count[thing.sid] = count + 1
            if ((count + 2) * 16 > this.sprite_buffer[thing.sid].vertices.length)
                this.sprite_buffer[thing.sid] = RenderBuffer.Expand(this.gl, this.sprite_buffer[thing.sid])
        } else {
            this.sprite_count[thing.sid] = 1
            this.sprite_buffer[thing.sid] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    remove_thing(thing) {
        for (let i = 0; i < this.thing_count; i++) {
            if (this.things[i] === thing) {
                for (let j = i; j < this.thing_count - 1; j++) this.things[j] = this.things[j + 1]
                this.thing_count--
                this.sprite_count[thing.sid]--
                break
            }
        }
    }
    add_block_cache(c) {
        if (this.block_cache_count === this.block_cache.length) {
            let cp = new Array(this.block_cache_count + 10)
            for (let i = 0; i < this.block_cache_count; i++)
                cp[i] = this.block_cache[i]
            this.block_cache = cp
        }
        this.block_cache[this.block_cache_count] = c
        this.block_cache_count++
    }
    remove_block_cache(c) {
        for (let i = 0; i < this.block_cache_count; i++) {
            if (this.block_cache[i] === c) {
                for (let j = i; j < this.block_cache_count - 1; j++)
                    this.block_cache[j] = this.block_cache[j + 1]
                this.block_cache_count--
                break
            }
        }
    }
    update() {
        this.thread_id = this.threads[this.thread_index]
        this.thread_index++
        if (this.thread_index === this.threads.length)
            this.thread_index = 0

        for (let i = 0; i < this.thing_count; i++)
            this.things[i].update(this)
    }
    render(g, x, y, z) {
        let gl = this.gl
        let sprite_set = this.sprite_set
        let sprite_buffer = this.sprite_buffer

        sprite_set.clear()
        for (let key in sprite_buffer)
            sprite_buffer[key].zero()

        g.set_program(gl, "texcol3d")
        g.update_mvp(gl)
        g.set_texture(gl, "map")

        for (let i = 0; i < OCCLUSION_VIEW_NUM; i++) {
            let block = this.viewable[i]

            block.render_things(sprite_set, sprite_buffer, g.mv)

            let mesh = block.mesh
            if (mesh.vertex_pos === 0)
                continue

            RenderSystem.BindVao(gl, mesh)

            if (x == block.x) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_X], block.count_side[WORLD_POSITIVE_X])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_X], block.count_side[WORLD_NEGATIVE_X])
            } else if (x > block.x)
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_X], block.count_side[WORLD_POSITIVE_X])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_X], block.count_side[WORLD_NEGATIVE_X])

            if (y == block.y) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Y], block.count_side[WORLD_POSITIVE_Y])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Y], block.count_side[WORLD_NEGATIVE_Y])
            } else if (y > block.y)
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Y], block.count_side[WORLD_POSITIVE_Y])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Y], block.count_side[WORLD_NEGATIVE_Y])

            if (z == block.z) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Z], block.count_side[WORLD_POSITIVE_Z])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Z], block.count_side[WORLD_NEGATIVE_Z])
            } else if (z > block.z)
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Z], block.count_side[WORLD_POSITIVE_Z])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Z], block.count_side[WORLD_NEGATIVE_Z])
        }

        g.set_program(gl, "texture3d")
        g.update_mvp(gl)
        for (let key in sprite_buffer) {
            let buffer = sprite_buffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(gl, key)
                RenderSystem.UpdateAndDraw(gl, buffer)
            }
        }
    }
}
