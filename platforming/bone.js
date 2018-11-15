class Bone {
    constructor(world, x, y, mirror) {
        this.half_width = 7
        this.height = 13
        this.mirror = mirror
        this.sprite_id = "doodad"
        this.animations = SPRITES["doodad"]
        this.sprite = this.animations["bone"]
        this.frame = 0
        this.frame_modulo = 0
        this.x = x
        this.y = y
        this.dx = mirror ? -2 : 2
        this.dy = GRAVITY * 5
        world.add_thing(this)
        this.block_borders()
        this.add_to_blocks(world)
    }
    block_borders() {
        this.left_gx = Math.floor((this.x - this.half_width) * INV_GRID_SIZE)
        this.right_gx = Math.floor((this.x + this.half_width) * INV_GRID_SIZE)
        this.bottom_gy = Math.floor(this.y * INV_GRID_SIZE)
        this.top_gy = Math.floor((this.y + this.height) * INV_GRID_SIZE)
    }
    add_to_blocks(world) {
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                world.get_block(gx, gy).add_thing(this)
            }
        }
    }
    remove_from_blocks(world) {
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                world.get_block(gx, gy).remove_thing(this)
            }
        }
    }
    damage() {}
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
                if (Tile.Empty(world.get_tile(gx, gy)))
                    continue
                if (!Tile.Empty(world.get_tile(gx - 1, gy)))
                    return true
            }
        } else {
            let gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
            for (let gy = bottom_gy; gy <= top_gy; gy++) {
                let tile = world.get_tile(gx, gy)
                if (Tile.Empty(tile))
                    continue
                if (!Tile.Empty(world.get_tile(gx + 1, gy)))
                    return true
            }
        }
        return false
    }
    tile_y_collision(world) {
        let left_gx = Math.floor((this.x - this.half_width) * INV_TILE_SIZE)
        let right_gx = Math.floor((this.x + this.half_width - 1) * INV_TILE_SIZE)

        if (this.dy > 0) {

        } else {
            let gy = Math.floor(this.y * INV_TILE_SIZE)
            for (let gx = left_gx; gx <= right_gx; gx++) {
                if (Tile.Empty(world.get_tile(gx, gy)))
                    continue
                if (!Tile.Empty(world.get_tile(gx, gy + 1)))
                    return true
            }
        }
        return false
    }
    tile_collision(world) {
        if (this.tile_x_collision(world) || this.tile_y_collision(world)) {
            world.delete_thing(this)
        }
    }
    overlap_boxes(_) {}
    overlap_thing(thing) {
        return this.x + this.half_width > thing.x - thing.half_width && this.x - this.half_width < thing.x + thing.half_width &&
            this.y + this.height > thing.y && this.y < thing.y + thing.height
    }
    thing_collision(world) {
        let searched = new Set()
        for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
            for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
                let block = world.get_block(gx, gy)
                for (let i = 0; i < block.thing_count; i++) {
                    let thing = block.things[i]
                    if (searched.has(thing)) continue
                    if (this.overlap_thing(thing)) {
                        thing.damage(world, 20)
                        world.delete_thing(this)
                        return
                    }
                    searched.add(thing)
                }
            }
        }
    }
    save() {
        return `{"id":"${this.sprite_id}","x":${Math.floor(this.x)},"y":${Math.floor(this.y)}}`
    }
}