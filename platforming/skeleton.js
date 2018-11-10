class Skeleton extends Thing {
    constructor(world, x, y) {
        super(world, "skeleton", x, y)
        this.speed = 0.25
        this.alliance = "undead"
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
    find_target(world) {
        let left_gx = Math.floor((this.x - 32) * INV_GRID_SIZE)
        let right_gx = Math.floor((this.x + 32) * INV_GRID_SIZE)
        let bottom_gy = Math.floor((this.y - 32) * INV_GRID_SIZE)
        let top_gy = Math.floor((this.y + 32) * INV_GRID_SIZE)
        for (let gx = left_gx; gx <= right_gx; gx++) {
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing.alliance === "good") {
                        this.target = thing
                        return
                    }
                }
            }
        }
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
            this.find_target(world)
        } else {
            this.mirror = this.target.x < this.x

            if (this.mirror) this.move_left()
            else this.move_right()

            if (this.attack_timer === 0) {
                new Bone(world, this.x, this.y + this.height * 1.5, this.mirror)
                this.attack_timer = 64
            } else
                this.attack_timer--
        }
        super.update(world)
    }
}