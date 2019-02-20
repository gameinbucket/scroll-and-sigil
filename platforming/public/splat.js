class Splat extends Thing {
    constructor(world, x, y) {
        super(world, "splat", "doodad", x, y)
        this.z = 0.9
        this.sprite_state = "splat"
        this.sprite = this.animations[this.sprite_state]
    }
    update(world) {
        this.frame_modulo++
        if (this.frame_modulo === ANIMATION_RATE) {
            this.frame_modulo = 0
            this.frame++
            if (this.frame === this.sprite.length) {
                world.delete_thing(this)
                this.frame--
            }
        }
    }
}