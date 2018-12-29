class Living extends Thing {
    constructor(world, uid, sprite_name, x, y) {
        super(world, uid, sprite_name, x, y)
        this.state = "idle"
        this.alliance = "none"
        this.speed = 2
        this.health_lim = 50
        this.health = this.health_lim
        this.stamina_lim = 50
        this.stamina = this.stamina_lim
    }
    death() {}
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
        if (!this.ground) return
        if (this.state !== "idle" && this.state !== "walk") return
        this.ground = false
        this.dy = 7.5
        this.move_air = this.state === "walk"
    }
    dodge() {}
    block() {}
    parry() {}
    light_attack() {
        const min_stamina = 24
        if (this.hand === null) return
        if (this.stamina < min_stamina) return
        if (this.state === "idle" || this.state === "walk") {
            this.stamina_reduce = this.stamina
            this.stamina -= min_stamina
            this.state = "attack"
            this.sprite = this.animations["attack"]
            this.frame = 0
            this.frame_modulo = 0
        } else if (this.state === "crouch") {
            this.stamina_reduce = this.stamina
            this.stamina -= min_stamina
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
    damage_scan(world) {
        let collided = []
        let searched = new Set()

        let boxes = [{
            x: 0,
            y: 24,
            width: this.reach,
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
            right_gx = Math.floor((this.x + this.reach) * INV_GRID_SIZE)
        } else {
            left_gx = Math.floor((this.x - this.reach) * INV_GRID_SIZE)
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
            thing.damage(world, this, this.attack)
        }
    }
    update(world) {
        super.update(world)
        if (this.stamina < this.stamina_lim && this.stamina_reduce <= this.stamina)
            this.stamina += 1
    }
}