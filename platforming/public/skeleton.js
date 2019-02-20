class Skeleton extends Living {
    constructor(world, x, y) {
        super(world, "skeleton", "skeleton", x, y)
        this.speed = 0.25
        this.alliance = "undead"
        this.target = null
        this.attack_timer = 0
        this.wander_timer = 0
        this.wait = false
    }
    damage(world, thing, amount) {
        if (this.state === "death") return

        this.health += amount
        if (this.health > 100) {
            this.ignore = true
            SOUND["destroy"].play()
            this.state = "death"
            this.sprite_state = "death"
            this.sprite = this.animations[this.sprite_state]
        } else {
            SOUND["you.hurt"].play()
            new Splat(world, this.x, this.y + this.height * 0.5)
        }
    }
    find_target(world) {
        let left_gx = Math.floor((this.x - 32) * INV_GRID_SIZE)
        let right_gx = Math.floor((this.x + 32) * INV_GRID_SIZE)
        let bottom_gy = Math.floor((this.y - 32) * INV_GRID_SIZE)
        let top_gy = Math.floor((this.y + 32) * INV_GRID_SIZE)

        if (left_gx < 0) left_gx = 0
        if (bottom_gy < 0) bottom_gy = 0
        if (right_gx >= world.width) right_gx = world.width - 1
        if (top_gy >= world.height) top_gy = world.height - 1

        for (let gx = left_gx; gx <= right_gx; gx++) {
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing.alliance === "good" && thing.state !== "death") {
                        this.target = thing
                        return
                    }
                }
            }
        }
    }
    check_ground_gap(world) {
        let gx
        if (this.mirror) gx = Math.floor((this.x - this.half_width - this.speed) * INV_TILE_SIZE)
        else gx = Math.floor((this.x + this.half_width + this.speed) * INV_TILE_SIZE)
        let gy = Math.floor(this.y * INV_TILE_SIZE)
        return !TILE_EMPTY[world.get_tile(gx, gy)]
    }
    update(world) {
        if (this.state === "death") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    world.delete_thing(this)
                    this.frame--
                    return
                }
            }
            super.update(world)
            return
        }

        if (!this.ground) {
            if (this.move_air) {
                if (this.mirror) this.dx = -this.speed
                else this.dx = this.speed
            }
        }

        if (world.thread_id === "ai") {
            if (this.target === null)
                this.find_target(world)
        }

        if (!this.wait) {
            if (this.mirror) this.move_left()
            else this.move_right()
        }

        if (this.target === null) {
            if (this.wander_timer === 0) {
                let next = Math.random()
                if (next > 0.9)
                    this.wait = true
                else {
                    this.wait = false
                    this.mirror = next > 0.45
                }
                this.wander_timer = Math.floor(Math.random() * 64 + 16)
            } else
                this.wander_timer--
        } else {
            if (world.thread_id === "ai") {
                if (this.target.state === "death") {
                    this.target = null
                } else {
                    if (this.x + this.half_width < this.target.x - this.target.half_width) {
                        this.mirror = false
                        this.wait = false
                    } else if (this.x - this.half_width > this.target.x + this.target.half_width) {
                        this.mirror = true
                        this.wait = false
                    } else
                        this.wait = true

                    if (this.check_ground_gap(world))
                        this.jump()

                    if (this.attack_timer === 0) {
                        if (Math.abs(this.x - this.target.x) < 64) {
                            new Bone(world, this.x, this.y + this.height * 1.5, this.mirror)
                            this.attack_timer = 40
                        }
                    } else
                        this.attack_timer--
                }
            }
        }

        super.update(world)
    }
}