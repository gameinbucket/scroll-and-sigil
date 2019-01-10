class You extends Living {
    constructor(world, x, y) {
        super(world, "you", "you", x, y)
        this.gx = Math.floor(this.x * INV_GRID_SIZE)
        this.substate = ""
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
        this.target_x = 0
        this.dodge_delta = 0
        this.charge_attack = false
        this.charge_multiplier = 1.0
        this.pierce_resist = 0 // todo
        this.crush_resist = 0 // todo
        this.slash_resist = 0 // todo
        this.bleed_resist = 0 // todo
        this.frost_resist = 0 // todo
        this.fire_resist = 0 // todo
        this.poison_resist = 0 // todo
    }
    damage(world, thing, amount) {
        if (this.health === 0 || this.ignore) return
        this.health_reduce = this.health
        this.health -= amount
        if (this.health < 0) this.health = 0
        SOUND["you.hurt"].play()
        this.state = "damaged"
        this.sprite_state = "damaged"
        this.sprite = this.animations[this.sprite_state]
        this.frame = 0
        this.frame_modulo = 0
        this.dy = GRAVITY * 8
        this.ground = false
        this.ignore = true
        this.mirror = thing.x < this.x
    }
    death() {
        SOUND["destroy"].play()
        this.state = "death"
        this.sprite_state = "death"
        this.sprite = this.animations[this.sprite_state]
        this.frame = 0
        this.frame_modulo = 0
    }
    afflict(affect) {
        this.afflictions.push(affect)
        affect.begin(this)
    }
    damage_scan(world) {
        let item = this.hand
        let searched = new Set()
        let boxes = this.boxes()

        let sprite = this.sprite[this.frame]
        let x = this.x - sprite.width * 0.5
        let y = this.y + sprite.oy

        if (this.mirror) x -= sprite.ox
        else x += sprite.ox

        let left_gx = Math.floor(x * INV_GRID_SIZE)
        let right_gx = Math.floor((x + sprite.width) * INV_GRID_SIZE)
        let bottom_gy = Math.floor(y * INV_GRID_SIZE)
        let top_gy = Math.floor((y + sprite.height) * INV_GRID_SIZE)

        for (let gx = left_gx; gx <= right_gx; gx++) {
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing === this || searched.has(thing)) continue
                    if (this.overlap(thing) && Thing.overlap_boxes(boxes, thing.boxes())) {
                        let damage = item.base_damage * this.charge_multiplier + item.strength_multiplier * this.strength + item.dexterity_multiplier * this.dexterity
                        thing.damage(world, this, damage)
                        this.experience += damage
                        if (this.experience > this.experience_lim) {
                            this.stat_points += 5
                            this.experience_lim = Math.floor(this.experience_lim * 1.5) + 5
                            SOUND["level.up"].play()
                        }
                    }
                    searched.add(thing)
                }
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
                    if (this.overlap(thing) && this.inventory_size + thing.size <= this.inventory_lim) {
                        SOUND["pick.up"].currentTime = 0
                        SOUND["pick.up"].play()
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
        this.sprite_state = "crouch"
        this.sprite = this.animations[this.sprite_state]
    }
    dodge_left() {
        const min_stamina = 24
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        if (this.stamina < min_stamina) return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
        this.mirror = true
        this.ignore = true
        this.state = "dodge"
        this.substate = "left"
        this.dodge_delta = 2
        this.sprite_state = "dodge"
        this.sprite = this.animations[this.sprite_state]
        this.frame = 0
        this.frame_modulo = 0
    }
    dodge_right() {
        const min_stamina = 24
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        if (this.stamina < min_stamina) return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
        this.mirror = false
        this.ignore = true
        this.state = "dodge"
        this.substate = "right"
        this.dodge_delta = 2
        this.sprite_state = "dodge"
        this.sprite = this.animations[this.sprite_state]
        this.frame = 0
        this.frame_modulo = 0
    }
    dodge() {
        const min_stamina = 24
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        if (this.stamina < min_stamina) return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
        this.ignore = true
        this.state = "dodge"
        this.substate = ""
        this.sprite_state = "dodge"
        this.sprite = this.animations[this.sprite_state]
        this.frame = 0
        this.frame_modulo = 0
    }
    stair_up(world) {
        let left_gx = Math.floor((this.x - 20) * INV_TILE_SIZE)
        let right_gx = Math.floor((this.x + 20) * INV_TILE_SIZE)
        let gy = Math.floor(this.y * INV_TILE_SIZE)
        for (let gx = left_gx; gx <= right_gx; gx++) {
            let t = world.get_tile(gx, gy)
            if (t === TILE_STAIRS_RIGHT) {
                this.state = "goto-stairs"
                this.substate = "upright"
                this.target_x = gx * TILE_SIZE
                return
            } else if (t === TILE_STAIRS_LEFT) {
                this.state = "goto-stairs"
                this.substate = "upleft"
                this.target_x = (gx + 1) * TILE_SIZE
                return
            }
        }
    }
    stair_down(world) {
        let left_gx = Math.floor((this.x - 20) * INV_TILE_SIZE)
        let right_gx = Math.floor((this.x + 20) * INV_TILE_SIZE)
        let gy = Math.floor((this.y - 1) * INV_TILE_SIZE)
        for (let gx = left_gx; gx <= right_gx; gx++) {
            let t = world.get_tile(gx, gy)
            if (t === TILE_STAIRS_RIGHT) {
                this.state = "goto-stairs"
                this.substate = "downleft"
                this.target_x = gx * TILE_SIZE
                return
            } else if (t === TILE_STAIRS_LEFT) {
                this.state = "goto-stairs"
                this.substate = "downright"
                this.target_x = (gx + 1) * TILE_SIZE
                return
            }
        }
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

        if (this.state === "dodge") {
            this.frame_modulo++
            if (this.frame_modulo == 32) {
                this.ignore = false
                this.state = "idle"
                this.sprite_state = "idle"
                this.sprite = this.animations[this.sprite_state]
                this.frame = 0
                this.frame_modulo = 0
            } else {
                if (this.substate === "left") {
                    this.dx = -this.dodge_delta
                    this.dodge_delta *= 0.9
                } else if (this.substate === "right") {
                    this.dx = this.dodge_delta
                    this.dodge_delta *= 0.9
                }
            }
            super.update(world)
            return
        }

        if (this.state === "goto-stairs") {
            if (this.substate === "upleft" || this.substate === "upright") {
                if (this.menu === null && Input.Is("ArrowUp")) {
                    let dist = Math.floor(this.target_x - this.x)
                    if (dist === 0) {
                        this.x = this.target_x
                        this.state = "stairs"
                        this.sprite_state = "stair.up"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                        if (this.substate === "upleft") {
                            this.mirror = true
                            this.target_x -= TILE_SIZE_HALF
                        } else {
                            this.mirror = false
                            this.target_x += TILE_SIZE_HALF
                        }
                    } else if (dist < 0) {
                        this.mirror = true
                        if (-dist < this.speed) this.dx = dist
                        else this.dx = -this.speed
                        this.sprite_state = "walk"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame_modulo++
                        if (this.frame_modulo === ANIMATION_RATE) {
                            this.frame_modulo = 0
                            this.frame++
                            if (this.frame === this.sprite.length)
                                this.frame = 0
                        }
                    } else {
                        this.mirror = false
                        if (dist < this.speed) this.dx = dist
                        else this.dx = this.speed
                        this.sprite_state = "walk"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame_modulo++
                        if (this.frame_modulo === ANIMATION_RATE) {
                            this.frame_modulo = 0
                            this.frame++
                            if (this.frame === this.sprite.length)
                                this.frame = 0
                        }
                    }
                } else {
                    this.state = "idle"
                    this.sprite_state = "idle"
                    this.sprite = this.animations[this.sprite_state]
                    this.frame = 0
                    this.frame_modulo = 0
                }
            } else {
                if (this.menu === null && Input.Is("ArrowDown")) {
                    let dist = Math.floor(this.target_x - this.x)
                    if (dist === 0) {
                        this.x = this.target_x
                        this.state = "stairs"
                        this.sprite_state = "stair.down"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                        if (this.substate === "downleft") {
                            this.mirror = true
                            this.target_x -= TILE_SIZE_HALF
                        } else {
                            this.mirror = false
                            this.target_x += TILE_SIZE_HALF
                        }
                    } else if (dist < 0) {
                        this.mirror = true
                        if (-dist < this.speed) this.dx = dist
                        else this.dx = -this.speed
                        this.sprite_state = "walk"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame_modulo++
                        if (this.frame_modulo === ANIMATION_RATE) {
                            this.frame_modulo = 0
                            this.frame++
                            if (this.frame === this.sprite.length)
                                this.frame = 0
                        }
                    } else {
                        this.mirror = false
                        if (dist < this.speed) this.dx = dist
                        else this.dx = this.speed
                        this.sprite_state = "walk"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame_modulo++
                        if (this.frame_modulo === ANIMATION_RATE) {
                            this.frame_modulo = 0
                            this.frame++
                            if (this.frame === this.sprite.length)
                                this.frame = 0
                        }
                    }
                } else {
                    this.state = "idle"
                    this.sprite_state = "idle"
                    this.sprite = this.animations[this.sprite_state]
                    this.frame = 0
                    this.frame_modulo = 0
                }
            }
            super.update(world)
            return
        }

        if (this.state === "stairs") {
            if (this.stamina < this.stamina_lim && this.stamina_reduce <= this.stamina)
                this.stamina += 1

            let climb = true
            let dist = Math.floor(this.target_x - this.x)
            if (dist === 0) {
                if (Math.floor(this.y) % TILE_SIZE == 0 && this.check_ground(world)) {
                    this.state = "idle"
                    this.sprite_state = "idle"
                    this.sprite = this.animations[this.sprite_state]
                    this.frame = 0
                    this.frame_modulo = 0
                    return
                }

                let up = this.menu === null && Input.Is("ArrowUp")
                let down = this.menu === null && Input.Is("ArrowDown")
                let left = this.menu === null && Input.Is("ArrowLeft")
                let right = this.menu === null && Input.Is("ArrowRight")

                if (up && !down) {
                    if (this.substate === "upleft") {
                        this.target_x -= TILE_SIZE_HALF
                    } else if (this.substate === "upright") {
                        this.target_x += TILE_SIZE_HALF
                    } else if (this.substate === "downleft") {
                        this.sprite_state = "stair.up"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "upright"
                        this.mirror = false
                        this.target_x += TILE_SIZE_HALF
                    } else if (this.substate === "downright") {
                        this.sprite_state = "stair.up"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "upleft"
                        this.mirror = true
                        this.target_x -= TILE_SIZE_HALF
                    }
                    this.frame_modulo = 0
                } else if (down && !up) {
                    if (this.substate === "upleft") {
                        this.sprite_state = "stair.down"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "downright"
                        this.mirror = false
                        this.target_x += TILE_SIZE_HALF
                    } else if (this.substate === "upright") {
                        this.sprite_state = "stair.down"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "downleft"
                        this.mirror = true
                        this.target_x -= TILE_SIZE_HALF
                    } else if (this.substate === "downleft") {
                        this.target_x -= TILE_SIZE_HALF
                    } else if (this.substate === "downright") {
                        this.target_x += TILE_SIZE_HALF
                    }
                    this.frame_modulo = 0
                } else if (left && !right) {
                    if (this.substate === "upright") {
                        this.sprite_state = "stair.down"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "downleft"
                        this.mirror = true
                    } else if (this.substate === "downright") {
                        this.sprite_state = "stair.up"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "upleft"
                        this.mirror = true
                    }
                    this.target_x -= TILE_SIZE_HALF
                    this.frame_modulo = 0
                } else if (right && !left) {
                    if (this.substate === "upleft") {
                        this.sprite_state = "stair.down"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "downright"
                        this.mirror = false
                    } else if (this.substate === "downleft") {
                        this.sprite_state = "stair.up"
                        this.sprite = this.animations[this.sprite_state]
                        this.substate = "upright"
                        this.mirror = false
                    }
                    this.target_x += TILE_SIZE_HALF
                    this.frame_modulo = 0
                } else
                    climb = false
            }

            if (climb) {
                this.frame_modulo++
                if (this.frame_modulo === ANIMATION_RATE) {
                    this.frame_modulo = 0
                    this.frame++
                    if (this.frame === this.sprite.length) {
                        this.frame = 0
                        this.frame_modulo = 0
                    }
                }

                let pace = 0.5
                if (this.substate === "upright") {
                    this.x += pace
                    this.y += pace
                } else if (this.substate === "upleft") {
                    this.x -= pace
                    this.y += pace
                } else if (this.substate === "downright") {
                    this.x += pace
                    this.y -= pace

                    if (Math.floor(this.y) % TILE_SIZE == 0 && this.check_ground(world)) {
                        this.state = "idle"
                        this.sprite_state = "idle"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                    }
                } else {
                    this.x -= pace
                    this.y -= pace

                    if (Math.floor(this.y) % TILE_SIZE == 0 && this.check_ground(world)) {
                        this.state = "idle"
                        this.sprite_state = "idle"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                    }
                }

                this.remove_from_blocks(world)
                this.block_borders()
                this.add_to_blocks(world)
            }

            return
        }

        if (this.state === "damaged") {
            if (this.mirror) this.dx = 2
            else this.dx = -2
            super.update(world)
            if (this.ground) {
                if (this.health < 1) this.death()
                else {
                    this.state = "idle"
                    this.sprite_state = "idle"
                    this.sprite = this.animations[this.sprite_state]
                    this.frame = 0
                    this.frame_modulo = 0
                    this.ignore = false
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
                this.sprite_state = "idle"
                this.sprite = this.animations[this.sprite_state]
                this.frame = 0
                this.frame_modulo = 0
            }
        }

        if (this.state === "attack") {
            if (this.charge_attack) {
                if (Input.Is("z")) {
                    this.charge_multiplier += 0.01
                    this.stamina -= 1
                    if (this.stamina <= 0) {
                        this.stamina = 0
                        this.charge_attack = false
                        this.state = "idle"
                        this.sprite_state = "idle"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                    }
                } else
                    this.charge_attack = false
            }
            if (!this.charge_attack) {
                this.frame_modulo++
                if (this.frame_modulo === ANIMATION_RATE) {
                    this.frame_modulo = 0
                    this.frame++
                    if (this.frame === this.sprite.length) {
                        this.state = "idle"
                        this.sprite_state = "idle"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                    } else if (this.frame === 1) {
                        this.charge_multiplier = 1.0
                        if (Input.Is("z"))
                            this.charge_attack = true
                    } else if (this.frame === this.sprite.length - 1) {
                        SOUND["you.whip"].play()
                        this.damage_scan(world)
                    }
                }
            }
        } else if (this.state === "crouch.attack") {
            if (this.charge_attack) {
                if (Input.Is("z")) {
                    this.charge_multiplier += 0.01
                    this.stamina -= 1
                    if (this.stamina <= 0) {
                        this.stamina = 0
                        this.charge_attack = false
                        this.state = "idle"
                        this.sprite_state = "idle"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                    }
                } else
                    this.charge_attack = false
            }
            if (!this.charge_attack) {
                this.frame_modulo++
                if (this.frame_modulo === ANIMATION_RATE) {
                    this.frame_modulo = 0
                    this.frame++
                    if (this.frame === this.sprite.length) {
                        this.state = "crouch"
                        this.sprite_state = "crouch"
                        this.sprite = this.animations[this.sprite_state]
                        this.frame = 0
                        this.frame_modulo = 0
                    } else if (this.frame === 1) {
                        this.charge_multiplier = 1.0
                        if (Input.Is("z"))
                            this.charge_attack = true
                    } else if (this.frame === this.sprite.length - 1) {
                        SOUND["you.whip"].play()
                        this.damage_scan(world)
                    }
                }
            }
        } else if (this.ground) {
            let up = this.menu === null && Input.Is("ArrowUp")
            let down = this.menu === null && Input.Is("ArrowDown")
            let left = this.menu === null && Input.Is("ArrowLeft")
            let right = this.menu === null && Input.Is("ArrowRight")

            if (up && !down) {
                this.stair_up(world)
            } else if (down && !up) {
                this.stair_down(world)
            } else if (left && !right) {
                this.move_left()
            } else if (right && !left) {
                this.move_right()
            } else if (this.state === "walk") {
                this.state = "idle"
                this.sprite_state = "idle"
                this.sprite = this.animations[this.sprite_state]
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
                        if (left && !right) this.dodge_left()
                        else if (right && !left) this.dodge_right()
                        else this.dodge()
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

        let gy = this.bottom_gy
        super.update(world)
        let gx = Math.floor(this.x * INV_GRID_SIZE)

        if (this.gx !== gx || this.bottom_gy !== gy) {
            world.theme(gx, this.bottom_gy)
            this.gx = gx
        }
    }
}