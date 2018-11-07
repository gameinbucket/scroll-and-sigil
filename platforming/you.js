class You extends Thing {
    constructor(world, x, y) {
        super(world, "you", x, y)
    }
    damage(amount) {
        if (this.health > 0) {
            this.health -= amount
            if (this.health < 1)
                this.death()
            else
                SOUND["you-hurt"].play()
        }
    }
    update(world) {
        if (this.state === "death") {
            world.delete_thing(this)
            super.update(world)
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

            this.crouch(Input.Is("ArrowDown"))

            if (Input.Is("Control")) this.block()
            if (Input.Is("v")) this.parry()
            if (Input.Is(" ")) this.jump()
            if (Input.Is("c")) this.dodge()
            if (Input.Is("z")) this.light_attack()
            if (Input.Is("x")) this.heavy_attack()
        }

        super.update(world)
    }
}