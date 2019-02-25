const ANIMATION_RATE = 8
const GRAVITY = 0.01

const THING_LIST = [{
    uid: "you",
    make: (world, x, y, z) => {
        return new You(world, x, y, z)
    }
}]

const THING_MAP = {}
for (let i in THING_LIST) {
    let thing = THING_LIST[i]
    THING_MAP[thing.uid] = thing
}

class Thing {
    constructor(world, uid, sid, x, y, z) {
        this.uid = uid
        this.sid = sid
        this.animations = SPRITE_ANIMATIONS[sid]
        this.sprite_data = SPRITE_DATA[sid]
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
        this.low_gx
        this.low_gy
        this.low_gz
        this.high_gx
        this.high_gy
        this.high_gz
        this.ground = false
        this.radius = 0.0001
        this.height = 1.0
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
        if (this.animation_mod === UNIT_ANIMATION_RATE) {
            this.animation_mod = 0
            this.animation_frame++
            if (this.animation_frame === this.animation.length)
                this.animation_frame = 0
        }
    }
    terrain_collision_y(world) {
        this.ground = false
        if (this.dy < 0) {
            let height = Math.floor(this.y)
            if (this.y < height) {
                this.y = height
                this.ground = true
                this.dy = 0
            }
        }
    }
    update(world) {
        // this.dy -= GRAVITY
        this.x += this.dx
        this.y += this.dy
        this.z += this.dz
        this.dx = 0
        this.dz = 0
        // this.terrain_collision_y(world)
        // this.animate()
    }
    render(sprite_buffer, model_view) {
        // let sprite = this.animation[this.animation_frame]
        let sprite_frame = this.sprite[this.animation_frame]
        let sprite = this.sprite_data[sprite_frame]
        if (this.mirror)
            Render3.MirrorSprite(sprite_buffer[this.sid], this.x, this.y + sprite.height, this.z, model_view, sprite)
        else
            Render3.Sprite(sprite_buffer[this.sid], this.x, this.y + sprite.height, this.z, model_view, sprite)
    }
}
