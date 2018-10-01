class World {
    constructor(block_w, block_h) {
        this.block_w = block_w
        this.block_h = block_h
        this.block_all = block_w * block_h
        this.blocks = []
        this.things = []

        this.collisions = new Set()
        this.block_cache = []
        this.block_cache_count = 0

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
    find_tile(x, y) {
        let cx = Math.floor(x / BLOCK_SIZE)
        let cy = Math.floor(y / BLOCK_SIZE)
        let bx = x % BLOCK_SIZE
        let by = y % BLOCK_SIZE
        let block = this.blocks[cx + cy * this.block_w]
        return block.tiles[bx + by * BLOCK_SIZE].type
    }
    get_tile(cx, cy, bx, by) {
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
        let block = this.get_block(cx, cy)
        if (block === null) {
            return null
        }
        return block.get_tile(bx, by)
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
    render(g, gl, sprite_buffers) {
        for (let key in sprite_buffers) {
            sprite_buffers[key].zero()
        }
        g.set_texture(gl, 'caverns')
        for (let i = 0; i < this.blocks.length; i++) {
            let block = this.blocks[i]
            let mesh = block.mesh
            if (mesh.vertex_pos > 0)
                RenderSystem.BindAndDraw(gl, mesh)
            block.render_things(sprite_buffers)
        }
        for (let key in sprite_buffers) {
            let buffer = sprite_buffers[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(gl, key)
                RenderSystem.UpdateAndDraw(gl, buffer)
            }
        }
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
    update() {
        this.collisions.clear()

        for (let i = 0; i < this.block_cache_count; i++) {
            let c = this.block_cache[i]
            for (let j = 0; j < c.physical_count; j++) {
                let a = c.physical[j]
                for (let k = j + 1; k < c.physical_count; k++) {
                    let b = c.physical[k]
                    let id = Math.floor(a.x) + ' ' + Math.floor(b.x) + ' ' + Math.floor(a.y) + ' ' + Math.floor(b.y)
                    if (!this.collisions.has(id)) {
                        this.collisions.add(id)
                        this.thing_overlap(a, b)
                    }
                }
            }
        }

        for (let i = 0; i < this.things.length; i++) {
            this.things[i].update(this)
        }
    }
    thing_overlap(a, b) {

    }
}