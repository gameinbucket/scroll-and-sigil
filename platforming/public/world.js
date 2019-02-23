class World {
    constructor(g, gl) {
        this.g = g
        this.gl = gl
        this.blocks = []
        this.width = 0
        this.height = 0
        this.sprite_set = new Set()
        this.sprite_buffer = {}
        this.sprite_count = {}
        this.things = []
        this.thing_count = 0
        this.delete_things = []
        this.delete_thing_count = 0
        this.threads = ["ai", "pathing"]
        this.thread_index = 0
        this.thread_id = ""
        this.red = 0.0
        this.green = 0.0
        this.blue = 0.0
    }
    load(data) {
        let content
        try {
            content = JSON.parse(data)
        } catch (err) {
            console.log("Failed to parse world", data)
            return
        }

        let you = null

        this.blocks = []
        this.width = 0
        this.height = 0
        this.sprite_set.clear()
        this.sprite_buffer = {}
        this.sprite_count = {}
        this.things = []
        this.thing_count = 0
        this.delete_things = []
        this.delete_thing_count = 0

        let blocks = content["blocks"]

        let left = null
        let right = null
        let top = null
        let bottom = null
        for (let b = 0; b < blocks.length; b++) {
            let block = blocks[b]
            let bx = block["x"]
            let by = block["y"]

            if (left === null || bx < left) left = bx
            if (right === null || bx > right) right = bx
            if (top === null || by > top) top = by
            if (bottom === null || by < bottom) bottom = by
        }

        this.width = right - left + 1
        this.height = top - bottom + 1

        for (let b = 0; b < blocks.length; b++) {
            let block = blocks[b]
            let bx = block["x"] - left
            let by = block["y"] - bottom
            let color = block["color"]
            let music = block["music"]
            let tiles = block["tiles"]

            block = new Block(bx, by)
            block.red = color[0]
            block.blue = color[1]
            block.green = color[2]
            block.music = music

            for (let t = 0; t < BLOCK_TOTAL; t++)
                block.tiles[t] = tiles[t]

            this.blocks[bx + by * this.width] = block
        }

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let i = x + y * this.width
                if (this.blocks[i] === null || this.blocks[i] === undefined)
                    this.blocks[i] = new Block(x, y)
            }
        }

        for (let b = 0; b < blocks.length; b++) {
            let block = blocks[b]
            let bx = block["x"] - left
            let by = block["y"] - bottom
            let things = block["things"]

            let px = bx * GRID_SIZE
            let py = by * GRID_SIZE

            for (let t = 0; t < things.length; t++) {
                let thing = things[t]
                let id = thing["id"]
                let x = thing["x"] + px
                let y = thing["y"] + py
                let item = THING_MAP[id]
                if (id === "you") {
                    if (you === null)
                        you = item.get(this, x, y)
                } else
                    item.get(this, x, y)
            }
        }

        this.build()
    }
    theme(bx, by) {
        let block = this.get_block(bx, by)
        this.red = block.red / 255.0
        this.green = block.green / 255.0
        this.blue = block.blue / 255.0
    }
    build() {
        for (let i = 0; i < this.blocks.length; i++)
            //    this.blocks[i].build_texture(this.g, this.gl)
            this.blocks[i].build_mesh(this.gl)
    }
    save(name) {
        let data = `{"name":"${name}","blocks":[`
        let block_data = []
        for (let i = 0; i < this.blocks.length; i++) {
            let block = this.blocks[i]
            if (block.is_empty()) continue
            block_data.push(block.save())
        }
        data += block_data.join(",")
        data += "]}"
        return data;
    }
    get_tile(x, y) {
        let block_x = Math.floor(x * INV_BLOCK_SIZE)
        let block_y = Math.floor(y * INV_BLOCK_SIZE)
        let tile_x = x % BLOCK_SIZE
        let tile_y = y % BLOCK_SIZE
        let block = this.blocks[block_x + block_y * this.width]
        return block.tiles[tile_x + tile_y * BLOCK_SIZE]
    }
    set_tile(x, y, tile) {
        let block_x = Math.floor(x * INV_BLOCK_SIZE)
        let block_y = Math.floor(y * INV_BLOCK_SIZE)
        let tile_x = x % BLOCK_SIZE
        let tile_y = y % BLOCK_SIZE
        let block = this.blocks[block_x + block_y * this.width]
        block.tiles[tile_x + tile_y * BLOCK_SIZE] = tile
    }
    get_block(x, y) {
        return this.blocks[x + y * this.width]
    }
    add_thing(thing) {
        this.things[this.thing_count] = thing
        this.thing_count++

        let count = this.sprite_count[thing.sprite_id]
        if (count) {
            this.sprite_count[thing.sprite_id] = count + 1
            if ((count + 2) * 16 > this.sprite_buffer[thing.sprite_id].vertices.length) {
                this.sprite_buffer[thing.sprite_id] = RenderBuffer.Expand(this.gl, this.sprite_buffer[thing.sprite_id])
            }
        } else {
            this.sprite_count[thing.sprite_id] = 1
            this.sprite_buffer[thing.sprite_id] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    remove_thing(thing) {
        for (let i = 0; i < this.thing_count; i++) {
            if (this.things[i] === thing) {
                for (let j = i; j < this.thing_count - 1; j++) this.things[j] = this.things[j + 1]
                this.thing_count--
                this.sprite_count[thing.sprite_id]--
                break
            }
        }
    }
    delete_thing(thing) {
        this.delete_things[this.delete_thing_count] = thing
        this.delete_thing_count++
    }
    render(g, frame, x, y, generic) {

        let gl = this.gl
        let hw = frame.width * 0.5
        let hh = frame.height * 0.5

        let c_min = Math.floor((x - hw) * INV_GRID_SIZE)
        let c_lim = Math.floor((x + hw) * INV_GRID_SIZE)
        let r_min = Math.floor((y - hh) * INV_GRID_SIZE)
        let r_lim = Math.floor((y + hh) * INV_GRID_SIZE)

        let sprite_set = this.sprite_set
        let sprite_buffer = this.sprite_buffer

        if (c_min < 0) c_min = 0
        if (r_min < 0) r_min = 0
        if (c_lim >= this.width) c_lim = this.width - 1
        if (r_lim >= this.height) r_lim = this.height - 1

        sprite_set.clear()
        for (let key in sprite_buffer)
            sprite_buffer[key].zero()

        g.set_texture(gl, "map")

        for (let gy = r_min; gy <= r_lim; gy++) {
            for (let gx = c_min; gx <= c_lim; gx++) {
                let block = this.blocks[gx + gy * this.width]

                let mesh = block.mesh
                if (mesh.vertex_pos > 0)
                    RenderSystem.BindAndDraw(gl, mesh)

                // let texture = block.texture
                // if (texture !== null) {
                //     g.set_texture_direct(this.gl, texture)
                //     generic.zero()
                //     Render.Image(generic, gx * GRID_SIZE, gy * GRID_SIZE, GRID_SIZE, GRID_SIZE, 0.0, 1.0, 1.0, 0.0)
                //     RenderSystem.UpdateAndDraw(this.gl, generic)
                // }

                block.render_things(sprite_set, sprite_buffer)
            }
        }

        gl.enable(gl.DEPTH_TEST)
        for (let key in sprite_buffer) {
            let buffer = sprite_buffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(gl, key)
                RenderSystem.UpdateAndDraw(gl, buffer)
            }
        }
        gl.disable(gl.DEPTH_TEST)
    }
    update() {
        this.thread_id = this.threads[this.thread_index]
        this.thread_index++
        if (this.thread_index === this.threads.length)
            this.thread_index = 0

        if (this.delete_thing_count > 0) {
            for (let i = 0; i < this.delete_thing_count; i++) {
                let deleting = this.delete_things[i]
                deleting.remove_from_blocks(this)
                this.remove_thing(deleting)
            }
            this.delete_thing_count = 0
        }
        for (let i = 0; i < this.thing_count; i++)
            this.things[i].update(this)
    }
}
