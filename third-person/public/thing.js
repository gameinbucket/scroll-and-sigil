const ANIMATION_RATE = 8
const GRAVITY = 0.01

const THING_LIST = [{
    uid: "you",
    make: (world, x, y, z) => {
        return new You(world, x, y, z)
    }
}, {
    uid: "skeleton",
    make: (world, x, y, z) => {
        return new Skeleton(world, x, y, z)
    }
}]

const THING_MAP = {}
for (let i in THING_LIST) {
    let thing = THING_LIST[i]
    THING_MAP[thing.uid] = thing
}

class Thing {
    constructor(world, uid, sid, x, y, z, radius, height) {
        this.uid = uid
        this.sid = sid
        this.animations = SPRITE_ANIMATIONS[sid]
        this.sprite_data = SPRITE_DATA_3D[sid]
        this.animation_frame = 0
        this.animation_frame_modulo = 0
        this.sprite_name = "idle"
        this.sprite = this.animations[this.sprite_name]
        this.x = x
        this.y = y
        this.z = z
        this.dx = 0
        this.dy = 0
        this.dz = 0
        this.ox = x
        this.oz = z
        this.low_gx
        this.low_gy
        this.low_gz
        this.high_gx
        this.high_gy
        this.high_gz
        this.ground = false
        this.radius = radius
        this.height = height
        world.add_thing(this)
        this.block_borders()
        this.add_to_blocks(world)
    }
    save(x, y, z) {
        return `{"id":"${this.uid}","x":${this.x - x},"y":${this.y - y},"z":${this.z - z}}`
    }
    block_borders() {
        this.low_gx = Math.floor((this.x - this.radius) * INV_BLOCK_SIZE)
        this.low_gy = Math.floor(this.y * INV_BLOCK_SIZE)
        this.low_gz = Math.floor((this.z - this.radius) * INV_BLOCK_SIZE)
        this.high_gx = Math.floor((this.x + this.radius) * INV_BLOCK_SIZE)
        this.high_gy = Math.floor((this.y + this.height) * INV_BLOCK_SIZE)
        this.high_gz = Math.floor((this.z + this.radius) * INV_BLOCK_SIZE)
    }
    add_to_blocks(world) {
        for (let gx = this.low_gx; gx <= this.high_gx; gx++)
            for (let gy = this.low_gy; gy <= this.high_gy; gy++)
                for (let gz = this.low_gz; gz <= this.high_gz; gz++)
                    world.get_block(gx, gy, gz).add_thing(this)
    }
    remove_from_blocks(world) {
        for (let gx = this.low_gx; gx <= this.high_gx; gx++)
            for (let gy = this.low_gy; gy <= this.high_gy; gy++)
                for (let gz = this.low_gz; gz <= this.high_gz; gz++)
                    world.get_block(gx, gy, gz).remove_thing(this)
    }
    animate() {
        this.animation_mod++
        if (this.animation_mod === ANIMATION_RATE) {
            this.animation_mod = 0
            this.animation_frame++
            if (this.animation_frame === this.animation.length)
                this.animation_frame = 0
        }
    }
    terrain_collision_y(world) {
        if (this.dy < 0) {
            let gx = Math.floor(this.x)
            let gy = Math.floor(this.y)
            let gz = Math.floor(this.z)
            let bx = Math.floor(gx * INV_BLOCK_SIZE)
            let by = Math.floor(gy * INV_BLOCK_SIZE)
            let bz = Math.floor(gz * INV_BLOCK_SIZE)
            let tx = gx - bx * BLOCK_SIZE
            let ty = gy - by * BLOCK_SIZE
            let tz = gz - bz * BLOCK_SIZE

            let tile = world.get_tile_type(bx, by, bz, tx, ty, tz)
            if (TILE_CLOSED[tile]) {
                this.y = gy + 1
                this.ground = true
                this.dy = 0
            }
        }
    }
    resolve(b) {
        let square = this.radius + b.radius
        if (Math.abs(this.x - b.x) > square || Math.abs(this.z - b.z) > square)
            return
        if (Math.abs(this.ox - b.x) > Math.abs(this.oz - b.z)) {
            if (this.ox - b.x < 0) this.x = b.x - square
            else this.x = b.x + square
            this.dx = 0.0
        } else {
            if (this.oz - b.z < 0) this.z = b.z - square
            else this.z = b.z + square
            this.dz = 0.0
        }
    }
    overlap(b) {
        let square = this.radius + b.radius
        return Math.abs(this.x - b.x) <= square && Math.abs(this.z - b.z) <= square
    }
    update(world) {
        if (this.dx != 0.0 || this.dz != 0.0) {
            this.ox = this.x
            this.oz = this.z

            this.x += this.dx
            this.z += this.dz

            let collided = []
            let searched = new Set()

            this.remove_from_blocks(world)

            for (let gx = this.low_gx; gx <= this.high_gx; gx++) {
                for (let gy = this.low_gy; gy <= this.high_gy; gy++) {
                    for (let gz = this.low_gz; gz <= this.high_gz; gz++) {
                        let block = world.get_block(gx, gy, gz)
                        for (let t = 0; t < block.thing_count; t++) {
                            let thing = block.things[t]
                            if (searched.has(thing)) continue
                            searched.add(thing)
                            if (this.overlap(thing)) collided.push(thing)
                        }
                    }
                }
            }

            while (collided.length > 0) {
                let closest = null
                let manhattan = Number.MAX_VALUE
                for (let i = 0; i < collided.length; i++) {
                    let thing = collided[i]
                    let dist = Math.abs(this.ox - thing.x) + Math.abs(this.oz - thing.y)
                    if (dist < manhattan) {
                        manhattan = dist
                        closest = thing
                    }
                }
                this.resolve(closest)
                collided.splice(closest)
            }

            this.block_borders()
            this.add_to_blocks(world)

            this.dx = 0.0
            this.dz = 0.0
        }

        if (!this.ground || this.dy != 0.0) {

            this.dy -= GRAVITY
            this.y += this.dy
            this.terrain_collision_y(world)

            this.remove_from_blocks(world)
            this.block_borders()
            this.add_to_blocks(world)
        }

        this.animate()
    }
    render(sprite_buffer, x, z) {
        let sin = x - this.x
        let cos = z - this.z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length

        let sprite_frame = this.sprite[this.animation_frame]
        let sprite = this.sprite_data[sprite_frame]
        Render3.Sprite(sprite_buffer[this.sid], this.x, this.y, this.z, sin, cos, sprite)
    }
    render3(sprite_buffer, model_view) {
        let sprite_frame = this.sprite[this.animation_frame]
        let sprite = this.sprite_data[sprite_frame]
        Render3.Sprite3(sprite_buffer[this.sid], this.x, this.y + sprite.height, this.z, model_view, sprite)
    }
}
