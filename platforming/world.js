const GRID_SIZE = BLOCK_SIZE * TILE_SIZE
const INV_GRID_SIZE = 1.0 / GRID_SIZE

class World {
    constructor() {
        this.block_w = null
        this.block_h = null
        this.block_all = null
        this.blocks = []
        this.things = new Array(6)
        this.thing_count = 0
        this.sprite_set = new Set()
        this.delete_things = new Array(2)
        this.delete_thing_count = 0
    }
    load(gl, sprites, data) {
        let content = JSON.parse(data)
        this.block_w = content["width"]
        this.block_h = content["height"]
        this.block_all = this.block_w * this.block_h
        let tiles = content["tiles"]
        let things = content["things"]

        let x = 0
        let y = 0
        let index = 0

        for (let b = 0; b < this.block_all; b++) {
            let block = new Block(x, y)
            this.blocks[b] = block
            for (let t = 0; t < BLOCK_TOTAL; t++) {
                block.tiles[t] = tiles[index]
                index++
            }
            x++
            if (x == this.block_w) {
                x = 0
                y++
            }
        }

        let you = null
        for (let t = 0; t < things.length; t++) {
            let thing = things[t]
            let id = thing["id"]
            let sprite = sprites[id]
            let x = thing["x"]
            let y = thing["y"]
            switch (id) {
                case "you":
                    if (you === null)
                        you = new You(this, id, sprite, x, y)
                    break
                case "skeleton":
                    new Skeleton(this, id, sprite, x, y)
                    break
            }
        }

        this.build(gl)
    }
    build(gl) {
        for (let i = 0; i < this.block_all; i++) {
            this.blocks[i].build_mesh(gl)
        }
    }
    save() {
        let tile_data = ""
        tile_data += this.blocks[0].save()
        for (let i = 1; i < this.blocks.length; i++) {
            tile_data += ","
            tile_data += this.blocks[i].save()
        }

        let thing_data = ""
        if (this.thing_count > 0) {
            thing_data += this.things[0].save()
            for (let i = 1; i < this.thing_count; i++) {
                thing_data += ","
                thing_data += this.things[i].save()
            }
        }

        return `{"width":${this.block_w},"height":${this.block_h},"tiles":[${tile_data}],"things":[${thing_data}]}`
    }
    get_tile(x, y) {
        let block_x = Math.floor(x * INV_BLOCK_SIZE)
        let block_y = Math.floor(y * INV_BLOCK_SIZE)
        let tile_x = x % BLOCK_SIZE
        let tile_y = y % BLOCK_SIZE
        let block = this.blocks[block_x + block_y * this.block_w]
        return block.tiles[tile_x + tile_y * BLOCK_SIZE]
    }
    set_tile(x, y, tile) {
        let block_x = Math.floor(x * INV_BLOCK_SIZE)
        let block_y = Math.floor(y * INV_BLOCK_SIZE)
        let tile_x = x % BLOCK_SIZE
        let tile_y = y % BLOCK_SIZE
        let block = this.blocks[block_x + block_y * this.block_w]
        block.tiles[tile_x + tile_y * BLOCK_SIZE] = tile
    }
    get_block(x, y) {
        return this.blocks[x + y * this.block_w]
    }
    add_thing(thing) {
        if (this.thing_count === this.things.length) {
            let copy = new Array(this.thing_count + 5)
            for (let i = 0; i < this.thing_count; i++) {
                copy[i] = this.things[i]
            }
            this.things = copy
        }
        this.things[this.thing_count] = thing
        this.thing_count++
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
        if (this.delete_thing_count === this.delete_things.length) {
            let copy = new Array(this.delete_thing_count + 5)
            for (let i = 0; i < this.delete_thing_count; i++) {
                copy[i] = this.delete_things[i]
            }
            this.delete_things = copy
        }
        this.delete_things[this.delete_thing_count] = thing
        this.delete_thing_count++
    }
    render(g, gl, frame, x, y, sprite_buffers) {
        this.sprite_set = new Set()
        for (let key in sprite_buffers) {
            sprite_buffers[key].zero()
        }

        let hw = frame.width * 0.5
        let hh = frame.height * 0.5

        let c_min = Math.floor((x - hw) * INV_GRID_SIZE)
        let c_lim = Math.floor((x + hw) * INV_GRID_SIZE)
        let r_min = Math.floor((y - hh) * INV_GRID_SIZE)
        let r_lim = Math.floor((y + hh) * INV_GRID_SIZE)

        if (c_min < 0) c_min = 0
        if (r_min < 0) r_min = 0
        if (c_lim >= this.block_w) c_lim = this.block_w - 1
        if (r_lim >= this.block_h) r_lim = this.block_h - 1

        g.set_texture(gl, "map")
        for (let gy = r_min; gy <= r_lim; gy++) {
            for (let gx = c_min; gx <= c_lim; gx++) {
                let block = this.blocks[gx + gy * this.block_w]
                let mesh = block.mesh
                if (mesh.vertex_pos > 0)
                    RenderSystem.BindAndDraw(gl, mesh)
                block.render_things(this.sprite_set, sprite_buffers)
            }
        }

        for (let key in sprite_buffers) {
            let buffer = sprite_buffers[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(gl, key)
                RenderSystem.UpdateAndDraw(gl, buffer)
            }
        }
    }
    update() {
        if (this.delete_thing_count > 0) {
            for (let i = 0; i < this.delete_thing_count; i++) {
                let deleting = this.delete_things[i]
                deleting.remove_from_blocks(this)
                this.remove_thing(deleting)
            }
            this.delete_thing_count = 0
        }
        for (let i = 0; i < this.thing_count; i++) {
            this.things[i].update(this)
        }
    }
}