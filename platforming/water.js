class Water extends Thing {
    constructor(world, x, y) {
        super(world, "item", x, y)
        this.half_width = 8
        this.height = 16
        this.sprite = this.animations["water"]
    }
    update(world) {
        if (!this.ground) this.dy -= GRAVITY
        this.x += this.dx
        this.y += this.dy
        this.remove_from_blocks(world)
        this.tile_collision(world)
        this.block_borders()
        // this.thing_collision(world)
        // this.block_borders()
        this.add_to_blocks(world)
        this.dx = 0
    }
}