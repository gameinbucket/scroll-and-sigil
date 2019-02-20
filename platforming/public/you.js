class You extends Living {
    constructor(world, x, y) {
        super(world, "you", "human", x, y)
        this.z = 0.7
        this.gx = Math.floor(this.x * INV_GRID_SIZE)
        this.substate = ""
        this.alliance = "good"
        this.inventory = []
        this.inventory_size = 0
        this.inventory_lim = 10
        this.menu = null
        this.stamina_reduce = 0
        this.sticky_jump = true
        this.sticky_dodge = true
        this.sticky_attack = true
        this.sticky_shild = true
        this.sticky_menu = true
        this.sticky_search = true
        this.sticky_item = true
        this.sticky_skill = true
        this.item = null
        this.hand = null
        this.offhand = null
        this.head = null
        this.body = null
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
        this.body_data = null
        this.weapon_data = null
        this.shield_data = null
        this.build_texture()
    }
    set_state(state) {
        this.state = state
        this.sprite_state = state
        this.sprite = this.animations[state]
        this.frame = 0
        this.frame_modulo = 0
    }
    set_state2(state, sprite) {
        this.state = state
        this.sprite_state = sprite
        this.sprite = this.animations[sprite]
        this.frame = 0
        this.frame_modulo = 0
    }
    set_sprite(sprite) {
        this.sprite_state = sprite
        this.sprite = this.animations[sprite]
        this.frame = 0
        this.frame_modulo = 0
    }
    damage(world, thing, amount) {
        if (this.ignore || this.state === "death") return

        if (this.state === "shield" || this.state === "crouch.shield") {
            if ((this.mirror && this.x > thing.x) || (!this.mirror && this.x < thing.x)) {
                this.stamina -= amount
                if (this.stamina >= 0) return
                amount = -this.stamina
                this.stamina = 0
            }
        }

        this.health += amount

        if (this.health > 100) {
            this.ignore = true
            SOUND["destroy"].play()
            this.set_state2("death", "damaged")
        } else {
            SOUND["you.hurt"].play()
            this.set_state("damaged")
        }

        this.dy = GRAVITY * 8
        this.ground = false
        this.mirror = thing.x < this.x
    }
    afflict(affect) {
        this.afflictions.push(affect)
        affect.begin(this)
    }
    damage_scan(world) {
        let item = this.hand
        let searched = new Set()
        let bounds = this.bounding_box()

        let left_gx = Math.floor(bounds[0] * INV_GRID_SIZE)
        let right_gx = Math.floor(bounds[2] * INV_GRID_SIZE)
        let bottom_gy = Math.floor(bounds[1] * INV_GRID_SIZE)
        let top_gy = Math.floor(bounds[3] * INV_GRID_SIZE)

        for (let gx = left_gx; gx <= right_gx; gx++) {
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing === this || thing.ignore || searched.has(thing)) continue
                    if (this.overlap(thing) && Thing.OverlapBoxes(this.weapon_boxes(), thing.boxes())) {
                        let damage = item.base_damage * this.charge_multiplier + item.strength_multiplier * this.strength + item.dexterity_multiplier * this.dexterity
                        thing.damage(world, this, damage)
                        this.experience += 1
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
                    if (this.inventory_size + thing.size <= this.inventory_lim && this.overlap(thing) && Thing.OverlapBoxes(this.boxes(), thing.boxes())) {
                        SOUND["pick.up"].currentTime = 0
                        SOUND["pick.up"].play()
                        this.inventory.push(thing)
                        this.inventory_size += thing.size
                        world.delete_thing(thing)
                        switch (thing.slot) {
                            case "hand":
                                if (this.hand === null)
                                    this.hand = thing
                                break
                            case "head":
                                if (this.head === null)
                                    this.head = thing
                                break
                            case "body":
                                if (this.body === null)
                                    this.body = thing
                                break
                            case "item":
                                if (this.item === null)
                                    this.item = thing
                                break
                            case "skill":
                                if (this.skill === null)
                                    this.skill = thing
                                break
                        }
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
        this.set_sprite("crouch")
    }
    shield() {
        let shield = "tower"
        const min_stamina = 4
        if (this.stamina < min_stamina) return
        if (this.state === "idle" || this.state === "walk") {
            this.set_state2("shield", shield + ".shield")
        } else if (this.state === "crouch") {
            this.set_state2("crouch.shield", shield + ".crouch.shield")
        } else
            return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
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
        this.set_state("dodge")
        this.substate = "left"
        this.dodge_delta = 2
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
        this.set_state("dodge")
        this.substate = "right"
        this.dodge_delta = 2
    }
    dodge() {
        const min_stamina = 24
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        if (this.stamina < min_stamina) return
        this.stamina_reduce = this.stamina
        this.stamina -= min_stamina
        this.ignore = true
        this.set_state("dodge")
        this.substate = ""
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
            if (this.ground) {
                if (this.sprite_state === "damaged") {
                    this.sprite_state = "death"
                    this.sprite = this.animations[this.sprite_state]
                }
                if (this.frame < this.sprite.length - 1) {
                    this.frame_modulo++
                    if (this.frame_modulo === ANIMATION_RATE) {
                        this.frame_modulo = 0
                        this.frame++
                    }
                } else {
                    // death screen
                }
            } else {
                if (this.mirror) this.dx = 2
                else this.dx = -2
            }
            super.update(world)
            return
        }

        if (this.state === "damaged") {
            if (this.mirror) this.dx = 2
            else this.dx = -2
            super.update(world)
            if (this.ground)
                this.set_state("idle")
            return
        }

        if (this.state === "dodge") {
            this.frame_modulo++
            if (this.frame_modulo == 32) {
                this.ignore = false
                this.set_state("idle")
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

        if (this.state === "breath") {
            this.frame_modulo++
            if (this.frame_modulo == ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length)
                    this.set_state("idle")
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
                        this.set_state2("stairs", "stair.up")
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
                } else
                    this.set_state("idle")
            } else {
                if (this.menu === null && Input.Is("ArrowDown")) {
                    let dist = Math.floor(this.target_x - this.x)
                    if (dist === 0) {
                        this.x = this.target_x
                        this.set_state2("stairs", "stair.down")
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
                } else
                    this.set_state("idle")
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
                    this.set_state("idle")
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

                    if (Math.floor(this.y) % TILE_SIZE == 0 && this.check_ground(world))
                        this.set_state("idle")
                }

                this.remove_from_blocks(world)
                this.block_borders()
                this.add_to_blocks(world)
            }

            return
        }

        if (!this.ground) {
            if (this.move_air) {
                if (this.mirror) this.dx = -this.speed
                else this.dx = this.speed
            }
            if (this.dy < 0 && (this.state === "idle" || this.state === "walk"))
                this.set_state("idle")
        }

        if (this.state === "shield" || this.state === "crouch.shield") {
            if (Input.Is("Control")) {
                this.stamina_reduce = this.stamina
                this.stamina -= 0.25
                if (this.stamina <= 0) {
                    this.stamina = 0
                    this.set_state("breath")
                }
            } else
                this.set_state("idle")
        } else if (this.state === "attack") {
            if (this.charge_attack) {
                if (Input.Is("z")) {
                    this.charge_multiplier += 0.01
                    this.stamina -= 1
                    if (this.stamina <= 0) {
                        this.stamina = 0
                        this.charge_attack = false
                        this.set_state("breath")
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
                        this.set_state("idle")
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
                        this.set_state("idle")
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
                        this.set_state("crouch")
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
                this.set_state("idle")
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
            if (Input.Is("x")) this.heavy_attack()

            if (Input.Is("Control")) {
                if (this.sticky_shield) {
                    this.shield()
                    this.sticky_shield = false
                }
            } else this.sticky_shield = true

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
    make_boxes(sprites) {
        let list = []
        for (let index = 0; index < sprites.length; index++) {
            let sprite = sprites[index]
            let boxes = sprite.boxes.slice()
            let x = Math.floor(this.x - sprite.width * 0.5)
            let y = Math.floor(this.y) + sprite.oy
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

            Array.prototype.push.apply(list, boxes);
        }
        return list
    }
    boxes() {
        let sprites = this.body_data[this.sprite[this.frame]]
        return this.make_boxes(sprites)
    }
    weapon_boxes() {
        let sprites = this.weapon_data[this.sprite[this.frame]]
        return this.make_boxes(sprites)
    }
    shield_boxes() {
        let sprites = this.shield_data[this.sprite[this.frame]]
        return this.make_boxes(sprites)
    }
    shielded(thing_boxes) {
        if (this.state === "shield" || this.state === "crouch.shield")
            return Thing.OverlapBoxes(this.shield_boxes(), thing_boxes)
        else return false
    }
    bounding_box() {
        let this_left = this.x
        let this_bottom = this.y
        let this_right = 1
        let this_top = 1
        let sprites = this.sprite_data[this.sprite[this.frame]]
        for (let index = 0; index < sprites.length; index++) {
            let sprite = sprites[index]
            let left = Math.floor(this.x - sprite.width * 0.5)
            if (this.mirror) left -= sprite.ox
            else left += sprite.ox
            let bottom = Math.floor(this.y) + sprite.oy
            if (left < this_left) this_left = left
            if (bottom < this_bottom) this_bottom = bottom
            let right = left + sprite.width
            let top = bottom + sprite.height
            if (right > this_right) this_right = right
            if (top > this_top) this_top = top
        }
        return [this_left, this_bottom, this_right, this_top]
    }
    build_texture() {
        let sprite_data = {}
        let body_data = {}
        let weapon_data = {}
        let shield_data = {}

        let weapon_type = "whip"
        let shield_type = "tower"
        let head_material = "leather"
        let body_material = "leather"

        let data = SPRITE_DATA["human"]
        let alias = SPRITE_ALIAS["human"]
        let animations = SPRITE_ANIMATIONS["human"]

        for (let key in animations) {
            let animation = animations[key]
            for (let index in animation) {
                let frame = animation[index]

                if (frame.includes("attack")) {
                    if (!frame.includes(weapon_type)) continue
                } else if (frame.includes("shield")) {
                    if (!frame.includes(shield_type)) continue
                }

                if (frame in sprite_data) continue

                body_data[frame] = []
                sprite_data[frame] = []
                let list = ["head", "body"]

                if (frame.includes("attack")) {
                    weapon_data[frame] = []
                    list.push("")
                } else if (frame.includes("shield")) {
                    shield_data[frame] = []
                    list.push("")
                }

                for (let i in list) {
                    let item
                    let value = list[i]

                    if (value !== "") item = value + "." + frame
                    else item = frame

                    if (item.includes("head")) item = head_material + "." + item
                    else if (item.includes("body")) item = body_material + "." + item

                    if (item in alias) {
                        let aliasing = alias[item]
                        let name_alias = item
                        let ox = 0
                        let oy = 0
                        if (aliasing.length === 1)
                            name_alias = aliasing[0]
                        else if (aliasing.length === 2) {
                            ox = aliasing[0]
                            oy = aliasing[1]
                        } else if (aliasing.length === 3) {
                            name_alias = aliasing[0]
                            ox = aliasing[1]
                            oy = aliasing[2]
                        }

                        let sprite = Sprite.Copy(data[name_alias], ox, oy)
                        sprite_data[frame].push(sprite)

                        if (item.includes("head") || item.includes("body")) {
                            body_data[frame].push(sprite)
                        } else {
                            if (frame.includes("attack")) weapon_data[frame].push(sprite)
                            else if (frame.includes("shield")) shield_data[frame].push(sprite)
                        }
                    } else {
                        let sprite = data[item]
                        sprite_data[frame].push(sprite)

                        if (item.includes("head") || item.includes("body")) {
                            body_data[frame].push(sprite)
                        } else {
                            if (frame.includes("attack")) weapon_data[frame].push(sprite)
                            else if (frame.includes("shield")) shield_data[frame].push(sprite)
                        }
                    }
                }
            }
        }

        this.sprite_data = sprite_data
        this.body_data = body_data
        this.weapon_data = weapon_data
        this.shield_data = shield_data
    }
    render(sprite_buffer) {
        let sprites = this.sprite_data[this.sprite[this.frame]]
        if (this.mirror) {
            for (let index = 0; index < sprites.length; index++) {
                let sprite = sprites[index]
                let x = Math.floor(this.x) - sprite.width * 0.5 - sprite.ox
                let y = Math.floor(this.y) + sprite.oy
                Render3.MirrorSprite(sprite_buffer["human"], x, y, this.z, sprite)
            }
        } else {
            for (let index = 0; index < sprites.length; index++) {
                let sprite = sprites[index]
                let x = Math.floor(this.x) - sprite.width * 0.5 + sprite.ox
                let y = Math.floor(this.y) + sprite.oy
                Render3.Sprite(sprite_buffer["human"], x, y, this.z, sprite)
            }
        }
    }
}