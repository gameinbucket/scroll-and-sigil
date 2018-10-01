const BLOCK_SIZE = 8
const BLOCK_TOTAL = BLOCK_SIZE * BLOCK_SIZE
const BLOCK_MESH = new RenderCopy(2, 0, 2, BLOCK_TOTAL * 4, BLOCK_TOTAL * 6)
class Block {
    constructor(px, py) {
        this.tiles = []
        this.mesh
        this.begin_side = new Array(6)
        this.count_side = new Array(6)
        this.x
        this.y
        this.things = []
        this.thing_count = 0
        this.physical = []
        this.physical_count = 0

        this.x = px
        this.y = py

        let x = 0
        for (let i = 0; i < BLOCK_TOTAL; i++) {
            let type = Math.random() > 0.5 ? TILE_GRASS : TILE_STONE
            let tile = new Tile()

            if (px === 1 && py === 1) {
                type = TILE_STONE
            }

            tile.type = type

            this.tiles[i] = tile
            x++
            if (x == BLOCK_SIZE) {
                x = 0
            }
        }
    }
    get_tile(x, y) {
        return this.tiles[x + y * BLOCK_SIZE]
    }
    add_thing(u) {
        if (this.thing_count === this.things.length) {
            let cp = new Array(this.thing_count + 5)
            for (let i = 0; i < this.thing_count; i++) {
                cp[i] = this.things[i]
            }
            this.things = cp
        }
        this.things[this.thing_count] = u
        this.thing_count++
    }
    remove_thing(u) {
        for (let i = 0; i < this.thing_count; i++) {
            if (this.things[i] === u) {
                for (let j = i; j < this.thing_count - 1; j++) {
                    this.things[j] = this.things[j + 1]
                }
                this.thing_count--
                break
            }
        }
    }
    add_physical(world, p) {
        if (this.physical_count === this.physical.length) {
            let cp = new Array(this.physical_count + 5)
            for (let i = 0; i < this.physical_count; i++) {
                cp[i] = this.physical[i]
            }
            this.physical = cp
        }
        this.physical[this.physical_count] = p
        this.physical_count++

        if (this.physical_count === 2) {
            world.add_chunk_cache(this)
        }
    }
    remove_physical(world, p) {
        for (let i = 0; i < this.physical_count; i++) {
            if (this.physical[i] === p) {
                for (let j = i; j < this.physical_count - 1; j++) {
                    this.physical[j] = this.physical[j + 1]
                }
                this.physical_count--
                if (this.physical_count === 1) {
                    world.remove_chunk_cache(this)
                }
                break
            }
        }
    }
    build_mesh(gl) {
        BLOCK_MESH.zero()
        let xx = this.x * BLOCK_SIZE * TILE_SIZE
        for (let x = 0; x < BLOCK_SIZE; x++) {
            let yy = this.y * BLOCK_SIZE * TILE_SIZE
            for (let y = 0; y < BLOCK_SIZE; y++) {
                let tile = this.get_tile(x, y)
                if (tile.type !== TILE_NONE) {
                    let texture = Tile.Texture(tile.type)
                    Render.Image(BLOCK_MESH, xx, yy, TILE_SIZE, TILE_SIZE, texture[0], texture[1], texture[2], texture[3])
                }
                yy += TILE_SIZE
            }
            xx += TILE_SIZE
        }
        this.mesh = RenderBuffer.InitCopy(gl, BLOCK_MESH)
    }
    render_things(sprite_buffers) {
        for (let i = 0; i < this.thing_count; i++) {
            let thing = this.things[i]
            let sprite = thing.sprite[thing.animation_frame]
            console.log(thing.x, thing.y)
            if (thing.mirror) {
                Render.MirrorSprite(sprite_buffers[thing.sprite_id], thing.x, thing.y + thing.height, sprite)
            } else {
                Render.Sprite(sprite_buffers[thing.sprite_id], thing.x, thing.y + thing.height, sprite)
            }
        }
    }
}