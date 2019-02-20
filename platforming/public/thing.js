const ANIMATION_RATE = 8
const GRAVITY = 0.55

const THING_LIST = [{
    id: "you",
    texture: "you",
    animation: "idle",
    get: (world, x, y) => {
        return new You(world, x, y)
    }
}, {
    id: "skeleton",
    texture: "skeleton",
    animation: "idle",
    get: (world, x, y) => {
        return new Skeleton(world, x, y)
    }
}, {
    id: "water",
    texture: "item",
    animation: "water",
    get: (world, x, y) => {
        return new Water(world, x, y)
    }
}, {
    id: "roar",
    texture: "item",
    animation: "roar",
    get: (world, x, y) => {
        return new Roar(world, x, y)
    }
}, {
    id: "whip",
    texture: "item",
    animation: "whip",
    get: (world, x, y) => {
        return new Whip(world, x, y)
    }
}, {
    id: "musket",
    texture: "item",
    animation: "musket",
    get: (world, x, y) => {
        return new Musket(world, x, y)
    }
}, {
    id: "helmet",
    texture: "item",
    animation: "helmet",
    get: (world, x, y) => {
        return new Helmet(world, x, y)
    }
}, {
    id: "armor",
    texture: "item",
    animation: "armor",
    get: (world, x, y) => {
        return new Armor(world, x, y)
    }
}, {
    id: "boots",
    texture: "item",
    animation: "boots",
    get: (world, x, y) => {
        return new Boots(world, x, y)
    }
}, {
    id: "gloves",
    texture: "item",
    animation: "gloves",
    get: (world, x, y) => {
        return new Gloves(world, x, y)
    }
}, {
    id: "mustket-ball",
    texture: "item",
    animation: "musket.ball",
    get: (world, x, y) => {
        return new MusketBall(world, x, y)
    }
}, {
    id: "shield",
    texture: "item",
    animation: "shield",
    get: (world, x, y) => {
        return new Shield(world, x, y)
    }
}, {
    id: "food",
    texture: "item",
    animation: "food",
    get: (world, x, y) => {
        return new Food(world, x, y)
    }
}, {
    id: "elevator",
    texture: "doodad",
    animation: "elevator",
    get: (world, x, y) => {
        return new Elevator(world, x, y)
    }
}]

const THING_MAP = {}
for (let i in THING_LIST) {
    let item = THING_LIST[i]
    THING_MAP[item.id] = item
}

class Resolution {
    constructor() {
        this.resolve = false
        this.delta = 0
        this.finite = false
    }
}

class Thing {
    constructor(world, uid, sprite_id, x, y) {
        this.half_width = 6
        this.height = 31
        this.uid = uid
        this.animations = SPRITE_ANIMATIONS[sprite_id]
        this.sprite_data = SPRITE_DATA[sprite_id]
        this.sprite_id = sprite_id
        this.sprite_state = "idle"
        this.sprite = this.animations[this.sprite_state]
        this.mirror = false
        this.frame = 0
        this.frame_modulo = 0
        this.x = x
        this.y = y
        this.z = 0.2
        this.dx = 0
        this.dy = 0
        this.ground = false
        this.ignore = false
        this.blocking = false
        world.add_thing(this)
        this.block_borders()
        this.add_to_blocks(world)
    }
    block_borders() {
        this.left_gx = Math.floor((this.x - this.half_width) * INV_GRID_SIZE)
        this.right_gx = Math.floor((this.x + this.half_width) * INV_GRID_SIZE)
        this.bottom_gy = Math.floor(this.y * INV_GRID_SIZE)
        this.top_gy = Math.floor((this.y + this.height) * INV_GRID_SIZE)
    }
    add_to_blocks(world) {
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                world.get_block(gx, gy).add_thing(this)
            }
        }
    }
    remove_from_blocks(world) {
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                world.get_block(gx, gy).remove_thing(this)
            }
        }
    }
    damage() {}
    update(world) {
        if (!this.ground) this.dy -= GRAVITY
        this.x += this.dx
        this.y += this.dy
        this.remove_from_blocks(world)
        this.tile_collision(world)
        this.simple_thing_collision(world)
        this.block_borders()
        this.add_to_blocks(world)

        if (this.ground) this.dx = 0
    }
    tile_x_collision(world, res) {
        let bottom_gy = Math.floor(this.y * INV_TILE_SIZE)
        let top_gy = Math.floor((this.y + this.height) * INV_TILE_SIZE)
        res.finite = true
        res.resolve = false
        if (this.dx > 0) {
            let gx = Math.floor((this.x + this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                if (TILE_EMPTY[world.get_tile(gx, gy)])
                    continue
                res.resolve = true
                res.delta = gx * TILE_SIZE - this.half_width
                if (!TILE_EMPTY[world.get_tile(gx - 1, gy)]) {
                    res.finite = false
                    return
                }
            }
        } else {
            let gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let tile = world.get_tile(gx, gy)
                if (TILE_EMPTY[tile])
                    continue
                res.resolve = true
                res.delta = (gx + 1) * TILE_SIZE + this.half_width
                if (!TILE_EMPTY[world.get_tile(gx + 1, gy)]) {
                    res.finite = false
                    return
                }
            }
        }
    }
    tile_y_collision(world, res) {
        let left_gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
        let right_gx = Math.floor((this.x + this.half_width - 1) * INV_TILE_SIZE)
        res.finite = true
        res.resolve = false
        if (this.dy > 0) {
            let gy = Math.floor((this.y + this.height) * INV_TILE_SIZE)
            for (let gx = left_gx; gx <= right_gx; gx++) {
                if (TILE_EMPTY[world.get_tile(gx, gy)])
                    continue
                res.resolve = true
                res.delta = gy * TILE_SIZE
                if (!TILE_EMPTY[world.get_tile(gx, gy - 1)]) {
                    res.finite = false
                    return
                }
            }
        } else {
            let gy = Math.floor(this.y * INV_TILE_SIZE)
            for (let gx = left_gx; gx <= right_gx; gx++) {
                if (TILE_EMPTY[world.get_tile(gx, gy)])
                    continue
                res.resolve = true
                res.delta = (gy + 1) * TILE_SIZE
                if (!TILE_EMPTY[world.get_tile(gx, gy + 1)]) {
                    res.finite = false
                    return
                }
            }
        }
    }
    check_ground(world) {
        let left_gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
        let right_gx = Math.floor((this.x + this.half_width) * INV_TILE_SIZE)
        let gy = Math.floor((this.y - 1) * INV_TILE_SIZE)
        for (let gx = left_gx; gx <= right_gx; gx++) {
            let t = world.get_tile(gx, gy)
            if (TILE_EMPTY[t])
                continue
            return true
        }
        return false
    }
    tile_collision(world) {
        let dxx = new Resolution()
        let dyy = new Resolution()
        this.tile_x_collision(world, dxx)
        this.tile_y_collision(world, dyy)

        let ground = false

        if (dxx.resolve) {
            if (dyy.resolve) {
                if (!dxx.finite && !dyy.finite) {
                    this.x = dxx.delta
                    this.y = dyy.delta
                    if (this.dy < 0) ground = true
                    this.dx = 0
                    this.dy = 0
                } else if (dxx.finite && !dyy.finite) {
                    this.x = dxx.delta
                    this.dx = 0
                    this.tile_y_collision(world, dyy)
                    if (dyy.resolve && dyy.finite) {
                        this.y = dyy.delta
                        if (this.dy < 0) ground = true
                        this.dy = 0
                    }
                } else if (dyy.finite && !dxx.finite) {
                    this.y = dyy.delta
                    if (this.dy < 0) ground = true
                    this.dy = 0
                    this.tile_x_collision(world, dxx)
                    if (dxx.resolve && dxx.finite) {
                        this.x = dxx.delta
                        this.dx = 0
                    }
                } else if (Math.abs(dxx.delta - this.x) < Math.abs(dyy.delta - this.y)) {
                    this.x = dxx.delta
                    this.dx = 0
                    this.tile_y_collision(world, dyy)
                    if (dyy.resolve && dyy.finite) {
                        this.y = dyy.delta
                        if (this.dy < 0) ground = true
                        this.dy = 0
                    }
                } else {
                    this.y = dyy.delta
                    if (this.dy < 0) ground = true
                    this.dy = 0
                    this.tile_x_collision(world, dxx)
                    if (dxx.resolve && dxx.finite) {
                        this.x = dxx.delta
                        this.dx = 0
                    }
                }
            } else {
                this.x = dxx.delta
                this.dx = 0
                this.tile_y_collision(world, dyy)
                if (dyy.resolve && dyy.finite) {
                    this.y = dyy.delta
                    if (this.dy < 0) ground = true
                    this.dy = 0
                }
            }
        } else if (dyy.resolve) {
            this.y = dyy.delta
            if (this.dy < 0) ground = true
            this.dy = 0
            this.tile_x_collision(world, dxx)
            if (dxx.resolve && dxx.finite) {
                this.x = dxx.delta
                this.dx = 0
            }
        }

        if (dyy.resolve) this.ground = ground
        else if (this.ground) this.ground = this.check_ground(world)
    }
    boxes() {
        let sprite_frame = this.sprite[this.frame]
        let sprite = this.sprite_data[sprite_frame]
        let boxes = sprite.boxes.slice()

        let x = this.x - sprite.width * 0.5
        let y = this.y + sprite.oy

        if (this.mirror) {
            x -= sprite.ox
            for (let index = 0; index < boxes.length; index++) {
                let box = boxes[index]
                box[0] = -(box[0] + box[2])
            }
        } else
            x += sprite.ox

        for (let index = 0; index < boxes.length; index++) {
            let box = boxes[index].slice()
            box[0] += x
            box[1] += y
            boxes[index] = box
        }

        return boxes
    }
    bounding_box() {
        let sprite = this.sprite_data[this.sprite[this.frame]]
        let left = this.x - sprite.width * 0.5
        if (this.mirror) left -= sprite.ox
        else left += sprite.ox
        let bottom = this.y + sprite.oy
        let right = left + sprite.width
        let top = bottom + sprite.height
        return [left, bottom, right, top]
    }
    overlap(thing) {
        let this_box = this.bounding_box()
        let thing_box = thing.bounding_box()

        return this_box[2] > thing_box[0] && this_box[0] < thing_box[2] &&
            this_box[3] > thing_box[1] && this_box[1] < thing_box[3]
    }
    overlap_simple(thing) {
        return this.x + this.half_width > thing.x - thing.half_width && this.x - this.half_width < thing.x + thing.half_width &&
            this.y + this.height > thing.y && this.y - 1 < thing.y + thing.height
    }
    shielded(thing) {
        return false
    }
    static OverlapBoxes(a, b) {
        for (let i = 0; i < a.length; i++) {
            let box_a = a[i]
            for (let j = 0; j < b.length; j++) {
                let box_b = b[j]
                if (box_a[0] + box_a[2] > box_b[0] && box_a[0] < box_b[0] + box_b[2] &&
                    box_a[1] + box_a[3] > box_b[1] && box_a[1] < box_b[1] + box_b[3])
                    return true
            }
        }
        return false
    }
    simple_thing_collision(world) {
        let collided = []
        let searched = new Set()

        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (this === thing || !thing.blocking || searched.has(thing)) continue
                    if (this.overlap_simple(thing)) collided.push(thing)
                    searched.add(thing)
                }
            }
        }

        let old_x = this.x - this.dx
        let old_y = this.y - this.dy
        while (collided.length > 0) {
            let closest = null
            let manhattan = Number.MAX_VALUE
            for (let i = 0; i < collided.length; i++) {
                let thing = collided[i]
                let dist = Math.abs(old_x - thing.x) + Math.abs(old_y - thing.y)
                if (dist < manhattan) {
                    manhattan = dist
                    closest = thing
                }
            }
            if (this.overlap_simple(closest))
                this.resolve_simple_thing_collision(closest)
            collided.splice(closest)
        }
    }
    resolve_simple_thing_collision(thing) {
        let old_x = this.x - this.dx
        let old_y = this.y - this.dy

        if (Math.abs(old_x - thing.x) > Math.abs(old_y - thing.y)) {
            if (old_x - thing.x < 0) this.x = thing.x - this.half_width - thing.half_width
            else this.x = thing.x + this.half_width + thing.half_width
            this.dx = 0
        } else {
            if (old_y - thing.y < 0) this.y = thing.y - this.height
            else {
                this.y = thing.y + thing.height
                this.ground = true
            }
            this.dy = 0
        }
    }
    render(sprite_buffer) {
        let sprite_frame = this.sprite[this.frame]
        let sprite = this.sprite_data[sprite_frame]

        let x = Math.floor(this.x - sprite.width * 0.5)
        let y = Math.floor(this.y + sprite.oy)

        if (this.mirror)
            Render3.MirrorSprite(sprite_buffer[this.sprite_id], x - sprite.ox, y, this.z, sprite)
        else
            Render3.Sprite(sprite_buffer[this.sprite_id], x + sprite.ox, y, this.z, sprite)
    }
    save(x, y) {
        return `{"id":"${this.uid}","x":${Math.floor(this.x - x)},"y":${Math.floor(this.y - y)}}`
    }
}