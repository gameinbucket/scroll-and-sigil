class Skeleton extends Thing {
    constructor(world, x, y) {
        super(world, "skeleton", x, y)
        this.target = null
        this.attack_timer = 0
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
    death() {
        SOUND["destroy"].play()
        this.state = "death"
        this.sprite = this.animations["death"]
    }
    update(world) {
        if (this.state === "death") {
            this.frame_modulo++
            if (this.frame_modulo === ANIMATION_RATE) {
                this.frame_modulo = 0
                this.frame++
                if (this.frame === this.sprite.length) {
                    world.delete_thing(this)
                    this.frame--
                    return
                }
            }
            super.update(world)
            return
        }
        if (this.target === null) {

        }
        if (this.attack_timer === 0) {
            new Bone(world, this.x, this.y)
            this.attack_timer = 300
        } else
            this.attack_timer--
        // this.move_left()
        super.update(world)
    }
}