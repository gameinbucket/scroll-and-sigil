const GRID_SIZE = BLOCK_SIZE * TILE_SIZE

class World {
    constructor(block_w, block_h) {
        this.block_w = block_w
        this.block_h = block_h
        this.block_all = block_w * block_h
        this.blocks = []
        this.things = new Array(6)
        this.thing_count = 0

        let x = 0
        let y = 0
        for (let i = 0; i < this.block_all; i++) {
            this.blocks[i] = new Block(x, y)
            x++
            if (x == this.block_w) {
                x = 0
                y++
            }
        }
    }
    build(gl) {
        for (let i = 0; i < this.block_all; i++) {
            this.blocks[i].build_mesh(gl)
        }
    }
    get_tile(x, y) {
        let block_x = Math.floor(x / BLOCK_SIZE)
        let block_y = Math.floor(y / BLOCK_SIZE)
        let tile_x = x % BLOCK_SIZE
        let tile_y = y % BLOCK_SIZE
        let block = this.blocks[block_x + block_y * this.block_w]
        return block.tiles[tile_x + tile_y * BLOCK_SIZE]
    }
    get_block(x, y) {
        if (x < 0 || x >= this.block_w) {
            return null
        }
        if (y < 0 || y >= this.block_h) {
            return null
        }
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
    render(g, gl, sprite_buffers) {
        let sprite_set = new Set()
        for (let key in sprite_buffers) {
            sprite_buffers[key].zero()
        }
        g.set_texture(gl, 'map')
        for (let i = 0; i < this.blocks.length; i++) {
            let block = this.blocks[i]
            let mesh = block.mesh
            if (mesh.vertex_pos > 0)
                RenderSystem.BindAndDraw(gl, mesh)
            block.render_things(sprite_set, sprite_buffers)
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
        for (let i = 0; i < this.thing_count; i++) {
            this.things[i].update(this)
        }
    }
}