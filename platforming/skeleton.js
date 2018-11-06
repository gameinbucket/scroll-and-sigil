class Skeleton extends Thing {
    constructor(world, sprite_id, animations, x, y) {
        super(world, sprite_id, animations, x, y)
    }
    update(world) {
        this.move_left()
        super.update(world)
    }
}