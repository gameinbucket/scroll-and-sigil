class Living extends Thing {
    constructor(world, uid, sprite_name, x, y) {
        super(world, uid, sprite_name, x, y)
        this.state = "idle"
        this.alliance = "none"
        this.speed = 2
        this.health = 0
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
            this.sprite_state = "walk"
            this.sprite = this.animations[this.sprite_state]
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
            this.sprite_state = "walk"
            this.sprite = this.animations[this.sprite_state]
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
    shield() {}
    parry() {}
    light_attack() {
        const min_stamina = 24
        if (this.hand === null) return
        if (this.stamina < min_stamina) return
        if (this.state === "idle" || this.state === "walk") {
            this.stamina_reduce = this.stamina
            this.stamina -= min_stamina
            this.state = "attack"
            this.sprite_state = "whip.attack"
            this.sprite = this.animations[this.sprite_state]
            this.frame = 0
            this.frame_modulo = 0
        } else if (this.state === "crouch") {
            this.stamina_reduce = this.stamina
            this.stamina -= min_stamina
            this.state = "crouch.attack"
            this.sprite_state = "whip.crouch.attack"
            this.sprite = this.animations[this.sprite_state]
            this.frame = 0
            this.frame_modulo = 0
        }
    }
    heavy_attack() {}
    crouch(down) {
        if (down) {
            if (this.ground && (this.state === "idle" || this.state === "walk")) {
                this.state = "crouch"
                this.sprite_state = "crouch"
                this.sprite = this.animations[this.sprite_state]
                this.frame = 0
                this.frame_modulo = 0
            }
        } else {
            if (this.state === "crouch") {
                this.state = "idle"
                this.sprite_state = "idle"
                this.sprite = this.animations[this.sprite_state]
                this.frame = 0
                this.frame_modulo = 0
            }
        }
    }
    damage_scan(world) {}
    update(world) {
        super.update(world)
        if (this.stamina < this.stamina_lim && this.stamina_reduce <= this.stamina)
            this.stamina += 1
    }
}