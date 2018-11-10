class You extends Thing {
    constructor(world, x, y) {
        super(world, "you", x, y)
        this.alliance = "good"
        this.inventory = []
    }
    damage(world, amount) {
        if (this.health > 0 && this.state !== "damaged") {
            this.health -= amount
            SOUND["you-hurt"].play()
            this.state = "damaged"
            this.sprite = this.animations["damaged"]
            this.frame = 0
            this.frame_modulo = 0
            this.dy = GRAVITY * 8
            this.ground = false
        }
    }
    death() {
        SOUND["destroy"].play()
        this.state = "death"
        this.sprite = this.animations["death"]
        this.frame = 0
        this.frame_modulo = 0
    }
    take(world) {
        if (!this.ground) return
        let searched = new Set()
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing.sprite_id !== "item" || searched.has(thing)) continue
                    if (this.overlap_thing(thing)) {
                        SOUND["pickup"].play()
                        this.inventory.push(thing)
                        world.delete_thing(thing)
                        return
                    }
                }
            }
        }
    }
    update(world) {
        if (this.state === "death") {
            if (this.frame < this.sprite.length - 1) {
                this.frame_modulo++
                if (this.frame_modulo === ANIMATION_RATE) {
                    this.frame_modulo = 0
                    this.frame++
                }
            }
            super.update(world)
            return
        }
        if (this.state === "damaged") {
            if (this.mirror) this.dx = 2
            else this.dx = -2
            super.update(world)
            if (this.ground) {
                if (this.health < 1)
                    this.death()
                else {
                    this.state = "idle"
                    this.sprite = this.animations["idle"]
                    this.frame = 0
                    this.frame_modulo = 0
                }
            }
            return
        }
        if (!this.ground) {
            if (this.move_air) {
                if (this.mirror) this.dx = -this.speed
                else this.dx = this.speed
            }
            if (this.dy < 0 && (this.state === "idle" || this.state === "walk")) {
                this.state = "idle"
                this.sprite = this.animations["idle"]
                this.frame = 0
                this.frame_modulo = 0
            }
        }
        if (this.state === "attack") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.state = "idle"
                    this.sprite = this.animations["idle"]
                    this.frame = 0
                    this.frame_modulo = 0
                } else if (this.frame === this.sprite.length - 1) {
                    SOUND["you-whip"].play()
                    this.damage_scan(world)
                }
            }
        } else if (this.state === "crouch-attack") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.state = "crouch"
                    this.sprite = this.animations["crouch"]
                    this.frame = 0
                    this.frame_modulo = 0
                } else if (this.frame === this.sprite.length - 1) {
                    SOUND["you-whip"].play()
                    this.damage_scan(world)
                }
            }
        } else if (this.ground) {
            let left = Input.Is("ArrowLeft")
            let right = Input.Is("ArrowRight")
            if (left && !right) {
                this.move_left()
            } else if (right && !left) {
                this.move_right()
            } else if (this.state === "walk") {
                this.state = "idle"
                this.sprite = this.animations["idle"]
                this.frame = 0
                this.frame_modulo = 0
                this.move_air = false
            }

            if (Input.Is(" ")) this.jump()
            if (Input.Is("c")) this.dodge()
        }

        this.crouch(Input.Is("ArrowDown"))
        if (Input.Is("Control")) this.block()
        if (Input.Is("v")) this.parry()
        if (Input.Is("z")) this.light_attack()
        if (Input.Is("x")) this.heavy_attack()
        if (Input.Is("a")) this.take(world)

        super.update(world)
    }
}