const ANIMATION_RATE = 8
const GRAVITY = 0.55

class Resolution {
    constructor() {
        this.resolve = false
        this.delta = 0
        this.finite = false
    }
}

class Thing {
    constructor(world, sprite_id, animations, x, y) {
        this.command
        this.half_width = 6
        this.height = 31
        this.speed = 2
        this.health = 1
        this.stamina = 100
        this.mirror = false
        this.animations = animations
        this.sprite_id = sprite_id
        this.state = "idle"
        this.sprite = animations["idle"]
        this.frame = 0
        this.frame_modulo = 0
        this.x = x
        this.y = y
        this.dx = 0
        this.dy = 0
        this.ground = false
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
    move_left() {
        if (!this.ground) return
        if (this.state === "idle") {
            this.mirror = true
            this.dx = -this.speed
            this.state = "walk"
            this.sprite = this.animations["walk"]
        } else if (this.state === "walk") {
            this.mirror = true
            this.dx = -this.speed
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.frame = 0
                }
            }
        }
    }
    move_right() {
        if (!this.ground) return
        if (this.state === "idle") {
            this.mirror = false
            this.dx = this.speed
            this.state = "walk"
            this.sprite = this.animations["walk"]
        } else if (this.state === "walk") {
            this.mirror = false
            this.dx = this.speed
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.frame = 0
                }
            }
        }
    }
    jump() {
        if (!this.ground || (this.state !== "idle" && this.state !== "walk")) return
        this.ground = false
        this.dy = 7.5
        this.frame = 0
        this.frame_modulo = 0
        this.sprite = this.animations["crouch"]
        this.move_air = this.state === "walk"
    }
    dodge() {
        if (!this.ground || (this.state !== "idle" && this.state !== "walk")) return
        this.ground = false
        this.dy = 4.5
        if (this.mirror)
            this.dx = this.speed * 0.25
        else
            this.dx = -this.speed * 0.25
    }
    block() {}
    parry() {}
    light_attack() {
        if (this.state === "idle" || this.state === "walk") {
            SOUND["sword"].play()
            this.state = "attack"
            this.sprite = this.animations["attack"]
            this.frame = 0
            this.frame_modulo = 0
        } else if (this.state === "crouch") {
            SOUND["sword"].play()
            this.state = "crouch-attack"
            this.sprite = this.animations["crouch-attack"]
            this.frame = 0
            this.frame_modulo = 0
        }
    }
    heavy_attack() {}
    crouch(down) {
        if (down) {
            if (this.ground && (this.state === "idle" || this.state === "walk")) {
                this.state = "crouch"
                this.sprite = this.animations["crouch"]
                this.frame = 0
                this.frame_modulo = 0
            }
        } else {
            if (this.state === "crouch") {
                this.state = "idle"
                this.sprite = this.animations["idle"]
                this.frame = 0
                this.frame_modulo = 0
            }
        }
    }
    update(world) {
        if (!this.ground) this.dy -= GRAVITY
        this.x += this.dx
        this.y += this.dy
        this.remove_from_blocks(world)
        this.tile_collision(world)
        // this.thing_collision(world)
        this.block_borders()
        this.add_to_blocks(world)

        if (this.stamina < 100)
            this.stamina += 1

        if (this.ground)
            this.dx = 0
    }
    tile_x_collision(world, res) {
        let bottom_gy = Math.floor(this.y * INV_TILE_SIZE)
        let top_gy = Math.floor((this.y + this.height) * INV_TILE_SIZE)
        res.finite = true
        res.resolve = false
        if (this.dx > 0) {
            let gx = Math.floor((this.x + this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                if (Tile.Empty(world.get_tile(gx, gy)))
                    continue
                res.resolve = true
                res.delta = gx * TILE_SIZE - this.half_width
                if (!Tile.Empty(world.get_tile(gx - 1, gy))) {
                    res.finite = false
                    return
                }
            }
        } else {
            let gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let tile = world.get_tile(gx, gy)
                if (Tile.Empty(tile))
                    continue
                res.resolve = true
                res.delta = (gx + 1) * TILE_SIZE + this.half_width
                if (!Tile.Empty(world.get_tile(gx + 1, gy))) {
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
            res.resolve = false
        } else {
            let gy = Math.floor(this.y * INV_TILE_SIZE)
            for (let gx = left_gx; gx <= right_gx; gx++) {
                if (Tile.Empty(world.get_tile(gx, gy)))
                    continue
                res.resolve = true
                res.delta = (gy + 1) * TILE_SIZE
                if (!Tile.Empty(world.get_tile(gx, gy + 1))) {
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
            if (Tile.Empty(t))
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
    resolve_collision_thing(b) {
        if (!this.overlap_thing(b)) return

        if (Math.abs(this.old_x - b.x) > Math.abs(this.old_y - b.y)) {
            if (this.old_x - b.x < 0) this.x = b.x - this.half_width - b.half_width
            else this.x = b.x + this.half_width + b.half_width
            this.dx = 0
        } else {
            if (this.old_y - b.y < 0) this.y = b.y - this.height
            else {
                this.y = b.y + b.height
                this.ground = true
            }
            this.dy = 0
        }
    }
    overlap_thing(b) {
        return this.x + this.half_width > b.x - b.half_width && this.x - this.half_width < b.x + b.half_width &&
            this.y + this.height > b.y && this.y < b.y + b.height
    }
    thing_collision(world) {
        let collided = new Array()
        let searched = new Set()

        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (searched.has(thing)) continue
                    if (this.overlap_thing(thing)) collided.push(thing)
                    searched.add(thing)
                }
            }
        }

        while (collided.length > 0) {
            let closest = null
            let manhattan = Number.MAX_VALUE
            for (let i = 0; i < collided.length; i++) {
                let thing = collided[i]
                let dist = Math.abs(this.old_x - thing.x) + Math.abs(this.old_y - thing.y)
                if (dist < manhattan) {
                    manhattan = dist
                    closest = thing
                }
            }
            this.resolve_collision_thing(closest)
            collided.splice(closest)
        }
    }
    save() {
        return `{"id":"${this.sprite_id}","x":${Math.floor(this.x)},"y":${Math.floor(this.y)}}`
    }
}