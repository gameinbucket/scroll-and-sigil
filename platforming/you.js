class You extends Thing {
    constructor(world, sprite_id, animations, x, y) {
        super(world, sprite_id, animations, x, y)
    }
    update(world) {
        if (this.state === "attack") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE_SLOW) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    this.state = "walk"
                    this.sprite = this.animations["walk"]
                    this.frame = 0
                    this.frame_modulo = 0
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