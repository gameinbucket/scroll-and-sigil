const BLOCK_SIZE = 8
const INV_BLOCK_SIZE = 1.0 / BLOCK_SIZE
const BLOCK_TOTAL = BLOCK_SIZE * BLOCK_SIZE
const BLOCK_MESH = new RenderCopy(2, 0, 2, BLOCK_TOTAL * 4, BLOCK_TOTAL * 6)

class Block {
    constructor(px, py) {
        this.tiles = new Uint8Array(BLOCK_TOTAL)
        this.mesh
        this.begin_side = new Array(6)
        this.count_side = new Array(6)
        this.x = px
        this.y = py
        this.things = new Array()
        this.thing_count = 0
    }
    save() {
        let concat = "" + this.tiles[0]
        for (let i = 1; i < BLOCK_TOTAL; i++) {
            concat += ","
            concat += this.tiles[i]
        }
        return concat + ""
    }
    get_tile(x, y) {
        return this.tiles[x + y * BLOCK_SIZE]
    }
    add_thing(thing) {
        if (this.thing_count === this.things.length) {
            let copy = new Array(this.thing_count + 3)
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
    build_mesh(gl) {
        BLOCK_MESH.zero()
        let xx = this.x * GRID_SIZE
        for (let x = 0; x < BLOCK_SIZE; x++) {
            let yy = this.y * GRID_SIZE
            for (let y = 0; y < BLOCK_SIZE; y++) {
                let tile = this.get_tile(x, y)
                if (tile !== TILE_NONE) {
                    let texture = Tile.Texture(tile)
                    Render.Image(BLOCK_MESH, xx, yy, TILE_SIZE, TILE_SIZE, texture[0], texture[1], texture[2], texture[3])
                }
                yy += TILE_SIZE
            }
            xx += TILE_SIZE
        }
        this.mesh = RenderBuffer.InitCopy(gl, BLOCK_MESH)
    }
    render_things(sprite_set, sprite_buffers) {
        for (let i = 0; i < this.thing_count; i++) {
            let thing = this.things[i]
            if (sprite_set.has(thing)) continue
            sprite_set.add(thing)
            let sprite = thing.sprite[thing.frame]
            let x = thing.x - sprite.width * 0.5
            let y = thing.y + sprite.oy
            if (thing.mirror) Render.MirrorSprite(sprite_buffers[thing.sprite_id], x - sprite.ox, y, sprite)
            else Render.Sprite(sprite_buffers[thing.sprite_id], x + sprite.ox, y, sprite)
        }
    }
}