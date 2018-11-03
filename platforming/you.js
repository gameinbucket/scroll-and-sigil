class You extends Thing {
    constructor(world, sprite_id, animations, x, y) {
        super(world, sprite_id, animations, x, y)
    }
    damage_scan(world) {
        let collided = new Array()
        let searched = new Set()

        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing === this || searched.has(thing)) continue
                    if (this.overlap_thing(thing)) collided.push(thing)
                    searched.add(thing)
                }
            }
        }

        for (let i = 0; i < collided.length; i++) {
            let thing = collided[i]
            thing.health -= 1
            if (thing.health < 1) {
                SOUND["death"].play()
            }
        }
    }
    update(world) {
        if (this.state === "attack") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE_SLOW) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.state = "idle"
                    this.sprite = this.animations["idle"]
                    this.frame = 0
                    this.frame_modulo = 0
                } else if (this.frame === this.sprite.length - 1) {
                    this.damage_scan(world)
                }
            }
        } else if (this.state === "crouch-attack") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE_SLOW) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.state = "crouch"
                    this.sprite = this.animations["crouch"]
                    this.frame = 0
                    this.frame_modulo = 0
                } else if (this.frame === this.sprite.length - 1) {
                    this.damage_scan(world)
                }
            }
        } else {
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
            }

            if (Input.Is("ArrowDown"))
                this.crouch()
            else
                this.stand()

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