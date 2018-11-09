class Skeleton extends Thing {
    constructor(world, x, y) {
        super(world, "skeleton", x, y)
        this.target = null
        this.attack_timer = 0
    }
    damage(world, amount) {
        if (this.health > 0) {
            this.health -= amount
            if (this.health < 1)
                this.death()
            else {
                SOUND["you-hurt"].play()
                new Splat(world, this.x, this.y + this.height * 0.5)
            }
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
            new Bone(world, this.x, this.y + this.height * 1.5)
            this.attack_timer = 64
        } else
            this.attack_timer--
        // this.move_left()
        super.update(world)
    }
}