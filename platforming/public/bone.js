class Bone extends Thing {
    constructor(world, x, y, mirror) {
        super(world, "bone", "doodad", x, y)
        this.z = 0.8
        this.half_width = 7
        this.height = 13
        this.mirror = mirror
        this.sprite_state = "bone"
        this.sprite = this.animations[this.sprite_state]
        this.dx = mirror ? -2 : 2
        this.dy = GRAVITY * 5
    }
    update(world) {
        this.dy -= GRAVITY
        this.x += this.dx
        this.y += this.dy
        this.remove_from_blocks(world)
        this.tile_collision(world)
        this.thing_collision(world)
        this.block_borders()
        this.add_to_blocks(world)
    }
    tile_x_collision(world) {
        let bottom_gy = Math.floor(this.y * INV_TILE_SIZE)
        let top_gy = Math.floor((this.y + this.height) * INV_TILE_SIZE)
        if (this.dx > 0) {
            let gx = Math.floor((this.x + this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                if (TILE_EMPTY[world.get_tile(gx, gy)])
                    continue
                if (!TILE_EMPTY[world.get_tile(gx - 1, gy)])
                    return true
            }
        } else {
            let gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let tile = world.get_tile(gx, gy)
                if (TILE_EMPTY[tile])
                    continue
                if (!TILE_EMPTY[world.get_tile(gx + 1, gy)])
                    return true
            }
        }
        return false
    }
    tile_y_collision(world) {
        let left_gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
        let right_gx = Math.floor((this.x + this.half_width - 1) * INV_TILE_SIZE)

        let gy
        if (this.dy > 0) gy = Math.floor((this.y + this.height) * INV_TILE_SIZE)
        else gy = Math.floor(this.y * INV_TILE_SIZE)

        for (let gx = left_gx; gx <= right_gx; gx++) {
            if (TILE_EMPTY[world.get_tile(gx, gy)]) continue
            if (!TILE_EMPTY[world.get_tile(gx, gy + 1)]) return true
        }

        return false
    }
    tile_collision(world) {
        if (this.tile_x_collision(world) || this.tile_y_collision(world))
            world.delete_thing(this)
    }
    thing_collision(world) {
        let searched = new Set()
        let boxes = this.boxes()
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (thing.ignore || searched.has(thing)) continue
                    if (this.overlap(thing)) {
                        if (thing.shielded(boxes)) {
                            world.delete_thing(this)
                            return
                        } else if (Thing.OverlapBoxes(boxes, thing.boxes())) {
                            thing.damage(world, this, 20)
                            world.delete_thing(this)
                            return
                        }
                    }
                    searched.add(thing)
                }
            }
        }
    }
}