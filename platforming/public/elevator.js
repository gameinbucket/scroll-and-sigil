class Elevator extends Thing {
    constructor(world, x, y) {
        super(world, "elevator", "doodad", x, y)
        this.z = 0.1
        this.half_width = 16
        this.height = 8
        this.blocking = true
        this.sprite_state = "elevator"
        this.sprite = this.animations[this.sprite_state]
    }
    update(world) {
        // this.dy -= GRAVITY
        // this.x += this.dx
        // this.y += this.dy
        // this.remove_from_blocks(world)
        // this.tile_collision(world)
        // this.thing_collision(world)
        // this.block_borders()
        // this.add_to_blocks(world)
    }
}