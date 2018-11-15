class You extends Thing {
    constructor(world, x, y) {
        super(world, "you", x, y)
        this.alliance = "good"
        this.inventory = []
        this.inventory_size = 0
        this.inventory_lim = 10
        this.menu = null
        this.health_reduce = 0
        this.stamina_reduce = 0
        this.sticky_jump = true
        this.sticky_dodge = true
        this.sticky_attack = true
        this.sticky_menu = true
        this.sticky_search = true
        this.sticky_item = true
        this.sticky_skill = true
        this.item = null
        this.hand = null
        this.offhand = null
        this.head = null
        this.body = null
        this.arms = null
        this.legs = null
        this.skill = null
        this.experience = 0
        this.experience_lim = 10
        this.strength = 1
        this.dexterity = 1
        this.stat_points = 0
        this.afflictions = []
        this.pierce_resist = 0 // todo
        this.crush_resist = 0 // todo
        this.slash_resist = 0 // todo
        this.bleed_resist = 0 // todo
        this.frost_resist = 0 // todo
        this.fire_resist = 0 // todo
        this.poison_resist = 0 // todo
    }
    damage(_, amount) {
        if (this.health > 0 && this.state !== "damaged") {
            this.health_reduce = this.health
            this.health -= amount
            if (this.health < 0)
                this.health = 0
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
    afflict(affect) {
        this.afflictions.push(affect)
        affect.begin(this)
    }
    damage_scan(world) {
        let item = this.hand
        let collided = new Array()
        let searched = new Set()

        let boxes = [{
            x: 0,
            y: 24,
            width: item.reach,
            height: 10
        }]

        let left_gx = 0
        let right_gx = 0
        let bottom_gy = Math.floor(this.y * INV_GRID_SIZE)
        let top_gy = Math.floor((this.y + this.height) * INV_GRID_SIZE)

        if (this.mirror) {
            for (let i in boxes) {
                let box = boxes[i]
                box.x = -(box.x + box.width)
            }
            left_gx = Math.floor(this.x * INV_GRID_SIZE)
            right_gx = Math.floor((this.x + item.reach) * INV_GRID_SIZE)
        } else {
            left_gx = Math.floor((this.x - item.reach) * INV_GRID_SIZE)
            right_gx = Math.floor(this.x * INV_GRID_SIZE)
        }

        for (let i in boxes) {
            let box = boxes[i]
            box.x += this.x
            box.y += this.y
        }

        for (let gx = left_gx; gx <= right_gx; gx++) {
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing === this || searched.has(thing)) continue
                    if (thing.overlap_boxes(boxes)) collided.push(thing)
                    searched.add(thing)
                }
            }
        }

        for (let i = 0; i < collided.length; i++) {
            let thing = collided[i]
            let damage = item.base_damage + item.strength_multiplier * this.strength + item.dexterity_multiplier * this.dexterity
            thing.damage(world, damage)
            this.experience += damage
            if (this.experience > this.experience_lim) {
                this.stat_points += 5
                this.experience_lim = Math.floor(this.experience_lim * 1.5) + 5
                SOUND["level-up"].play()
            }
        }
    }
    search(world) {
        if (!this.ground) return
        let searched = new Set()
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing.sprite_id !== "item" || searched.has(thing)) continue
                    if (this.overlap_thing(thing) && this.inventory_size + thing.size <= this.inventory_lim) {
                        SOUND["pick-up"].currentTime = 0
                        SOUND["pick-up"].play()
                        this.inventory.push(thing)
                        this.inventory_size += thing.size
                        world.delete_thing(thing)
                        return
                    }
                }
            }
        }
    }
    use_item() {
        if (this.item === null) return
        this.item.use(this)
    }
    use_skill() {
        if (this.skill === null) return
        this.skill.use(this)
    }
    jump() {
        const min_stamina = 24
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        if (this.stamina < min_stamina) return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
        this.ground = false
        this.dy = 7.5
        this.move_air = this.state === "walk"
        this.frame = 0
        this.frame_modulo = 0
        this.sprite = this.animations["crouch"]
    }
    dodge() {
        const min_stamina = 24
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        if (this.stamina < min_stamina) return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
        this.ground = false
        this.dy = 5.5
        if (this.mirror) this.dx = this.speed * 0.6
        else this.dx = -this.speed * 0.6
        this.frame = 0
        this.frame_modulo = 0
        this.sprite = this.animations["crouch"]
    }
    update(world) {
        if (this.health_reduce > this.health)
            this.health_reduce--
        if (this.stamina_reduce > this.stamina)
            this.stamina_reduce--
        for (let index = 0; index < this.afflictions.length; index++) {
            let afflict = this.afflictions[index]
            afflict.time--
            if (afflict.time === 0) {
                afflict.end(this)
                this.afflictions.splice(index)
                index--
            }
        }

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
            let left = this.menu === null && Input.Is("ArrowLeft")
            let right = this.menu === null && Input.Is("ArrowRight")
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

            if (this.menu === null) {
                if (Input.Is(" ")) {
                    if (this.sticky_jump) {
                        this.jump()
                        this.sticky_jump = false
                    }
                } else this.sticky_jump = true

                if (Input.Is("c")) {
                    if (this.sticky_dodge) {
                        this.dodge()
                        this.sticky_dodge = false
                    }
                } else this.sticky_dodge = true
            }
        }

        if (Input.Is("i")) {
            if (this.sticky_menu) {
                if (this.menu === null) {
                    this.menu = new Menu(this)
                } else
                    this.menu = null
                this.sticky_menu = false
            }
        } else this.sticky_menu = true

        if (this.menu === null) {
            this.crouch(Input.Is("ArrowDown"))
            if (Input.Is("v")) this.parry()
            if (Input.Is("Control")) this.block()
            if (Input.Is("x")) this.heavy_attack()

            if (Input.Is("z")) {
                if (this.sticky_attack) {
                    this.light_attack()
                    this.sticky_attack = false
                }
            } else this.sticky_attack = true

            if (Input.Is("a")) {
                if (this.sticky_search) {
                    this.search(world)
                    this.sticky_search = false
                }
            } else this.sticky_search = true

            if (Input.Is("e")) {
                if (this.sticky_item) {
                    this.use_item()
                    this.sticky_item = false
                }
            } else this.sticky_item = true

            if (Input.Is("f")) {
                if (this.sticky_skill) {
                    this.use_skill()
                    this.sticky_skill = false
                }
            } else this.sticky_skill = true
        } else
            this.menu.select()

        super.update(world)
    }
}