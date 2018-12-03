const GRID_SIZE = BLOCK_SIZE * TILE_SIZE
const INV_GRID_SIZE = 1.0 / GRID_SIZE

class World {
    constructor(gl) {
        this.gl = gl
        this.blocks = []
        this.width = 0
        this.height = 0
        this.global_blocks = {}
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
        this.global_blocks = {}
        this.sprite_set.clear()
        this.sprite_buffer = {}
        this.sprite_count = {}
        this.things = []
        this.thing_count = 0
        this.delete_things = []
        this.delete_thing_count = 0

        let blocks = content["blocks"]
        for (let b = 0; b < blocks.length; b++) {
            let block = blocks[b]
            let bx = block["x"]
            let by = block["y"]
            let color = block["color"]
            let music = block["music"]
            let tiles = block["tiles"]

            if (bx >= this.width) this.width = bx + 1
            if (by >= this.height) this.height = by + 1

            block = new Block(bx, by)
            block.red = color[0]
            block.blue = color[1]
            block.green = color[2]
            block.music = music

            for (let t = 0; t < BLOCK_TOTAL; t++)
                block.tiles[t] = tiles[t]

            this.global_blocks[bx + "/" + by] = block
        }

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let i = x + y * this.width
                let key = x + "/" + y
                if (key in this.global_blocks)
                    this.blocks[i] = this.global_blocks[key]
                else
                    this.blocks[i] = new Block(x, y)
            }
        }

        for (let b = 0; b < blocks.length; b++) {
            let block = blocks[b]
            let bx = block["x"]
            let by = block["y"]
            let things = block["things"]

            let px = bx * GRID_SIZE
            let py = by * GRID_SIZE

            for (let t = 0; t < things.length; t++) {
                let thing = things[t]
                let id = thing["id"]
                let x = thing["x"] + px
                let y = thing["y"] + py
                switch (id) {
                    case "you":
                        if (you === null)
                            you = new You(this, x, y)
                        break
                    case "skeleton":
                        new Skeleton(this, x, y)
                        break
                    case "water":
                        new Water(this, x, y)
                        break
                    case "roar":
                        new Roar(this, x, y)
                        break
                    case "whip":
                        new Whip(this, x, y)
                        break
                    case "musket":
                        new Musket(this, x, y)
                        break
                    case "helmet":
                        new Helmet(this, x, y)
                        break
                    case "armor":
                        new Armor(this, x, y)
                        break
                    case "boots":
                        new Boots(this, x, y)
                        break
                    case "gloves":
                        new Gloves(this, x, y)
                        break
                    case "musket-ball":
                        new MusketBall(this, x, y)
                        break
                    case "shield":
                        new Shield(this, x, y)
                        break
                    case "food":
                        new Food(this, x, y)
                        break
                }
            }
        }

        if (you !== null) {
            let bx = Math.floor(you.x * INV_GRID_SIZE)
            let by = Math.floor(you.y * INV_GRID_SIZE)

            // this.center(bx, by)
            this.theme(bx, by)
        }

        this.build()
    }
    // center(bx, by) {
    //     for (let y = 0; y < WORLD_SIZE; y++) {
    //         for (let x = 0; x < WORLD_SIZE; x++) {
    //             let i = x + y * WORLD_SIZE
    //             let key = x + "/" + y
    //             if (this.global_blocks.has(key))
    //                 this.blocks[i] = this.global_blocks[key]
    //             else
    //                 this.blocks[i] = new Block(x, y)
    //         }
    //     }
    // }
    theme(bx, by) {
        let block = this.get_block(bx, by)
        this.gl.clearColor(block.red / 255.0, block.green / 255.0, block.blue / 255.0, 1.0)
    }
    build() {
        for (let i = 0; i < this.blocks.length; i++)
            this.blocks[i].build_mesh(this.gl)
    }
    save(name) {
        let data = `{"name":"${name}","blocks":[`
        data += this.blocks[0].save()
        for (let i = 1; i < this.blocks.length; i++) {
            data += ","
            data += this.blocks[i].save()
        }
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
    // get_global_block(x, y) {
    //     return this.global_blocks[x + "/" + y]
    // }
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
            this.sprite_buffer[thing.sprite_id] = RenderBuffer.Init(this.gl, 2, 0, 2, 40, 60)
        }
    }
    remove_thing(thing) {
        for (let i = 0; i < this.thing_count; i++) {
            if (this.things[i] === thing) {
                for (let j = i; j < this.thing_count - 1; j++) {
                    this.things[j] = this.things[j + 1]
                }
                this.thing_count--
                break
            }
        }
    }
    delete_thing(thing) {
        this.delete_things[this.delete_thing_count] = thing
        this.delete_thing_count++
    }
    render(g, frame, x, y) {
        let hw = frame.width * 0.5
        let hh = frame.height * 0.5

        let c_min = Math.floor((x - hw) * INV_GRID_SIZE)
        let c_lim = Math.floor((x + hw) * INV_GRID_SIZE)
        let r_min = Math.floor((y - hh) * INV_GRID_SIZE)
        let r_lim = Math.floor((y + hh) * INV_GRID_SIZE)

        if (c_min < 0) c_min = 0
        if (r_min < 0) r_min = 0
        if (c_lim >= this.width) c_lim = this.width - 1
        if (r_lim >= this.height) r_lim = this.height - 1

        let sprite_buffer = this.sprite_buffer
        g.set_texture(this.gl, "map")
        this.sprite_set.clear()
        for (let key in sprite_buffer)
            sprite_buffer[key].zero()

        for (let gy = r_min; gy <= r_lim; gy++) {
            for (let gx = c_min; gx <= c_lim; gx++) {
                let block = this.blocks[gx + gy * this.width]
                let mesh = block.mesh
                if (mesh.vertex_pos > 0)
                    RenderSystem.BindAndDraw(this.gl, mesh)
                block.render_things(this.sprite_set, sprite_buffer)
            }
        }

        for (let key in sprite_buffer) {
            let buffer = sprite_buffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(this.gl, key)
                RenderSystem.UpdateAndDraw(this.gl, buffer)
            }
        }
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