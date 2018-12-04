class Editing {
    static SetTile(edit, tile) {
        let px = edit.mouse_to_world_x()
        let py = edit.mouse_to_world_y()

        let world = edit.world

        if (px < 0) {
            px = -px
            let add = Math.floor(px * INV_GRID_SIZE) + 1
            let new_width = world.width + add
            let offset = add * GRID_SIZE
            let new_blocks = []

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < world.height; y++)
                    new_blocks[add + x + y * new_width] = world.blocks[x + y * world.width]

            for (let x = 0; x < add; x++)
                for (let y = 0; y < world.height; y++)
                    new_blocks[x + y * new_width] = new Block(x, y)

            world.blocks = new_blocks
            world.width = new_width

            for (let x = 0; x < world.width; x++) {
                for (let y = 0; y < world.height; y++) {
                    let block = world.blocks[x + y * world.width]
                    block.x = x
                    block.y = y
                    block.build_mesh(edit.gl)
                    for (let i = 0; i < block.thing_count; i++)
                        block.things[i].x += offset
                    world.global_blocks[x + "/" + y] = block
                }
            }

            edit.camera.x += offset
            Editing.SetTile(edit, tile)
            return
        } else if (px >= world.width * GRID_SIZE) {
            let new_width = Math.floor(px * INV_GRID_SIZE) + 1
            let new_blocks = []

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < world.height; y++)
                    new_blocks[x + y * new_width] = world.blocks[x + y * world.width]

            for (let x = world.width; x < new_width; x++) {
                for (let y = 0; y < world.height; y++) {
                    let block = new Block(x, y)
                    block.build_mesh(edit.gl)
                    new_blocks[x + y * new_width] = block
                }
            }

            world.blocks = new_blocks
            world.width = new_width

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < world.height; y++)
                    world.global_blocks[x + "/" + y] = world.blocks[x + y * world.width]
        }

        if (py < 0) {
            py = -py
            let add = Math.floor(py * INV_GRID_SIZE) + 1
            let new_height = world.height + add
            let offset = add * GRID_SIZE
            let new_blocks = []

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < world.height; y++)
                    new_blocks[x + (y + add) * world.width] = world.blocks[x + y * world.width]

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < add; y++)
                    new_blocks[x + y * world.width] = new Block(x, y)

            world.blocks = new_blocks
            world.height = new_height

            for (let x = 0; x < world.width; x++) {
                for (let y = 0; y < world.height; y++) {
                    let block = world.blocks[x + y * world.width]
                    block.x = x
                    block.y = y
                    block.build_mesh(edit.gl)
                    for (let i = 0; i < block.thing_count; i++)
                        block.things[i].y += offset
                    world.global_blocks[x + "/" + y] = block
                }
            }

            edit.camera.y += offset
            Editing.SetTile(edit, tile)
            return
        } else if (py >= world.height * GRID_SIZE) {
            let new_height = Math.floor(py * INV_GRID_SIZE) + 1
            let new_blocks = []

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < world.height; y++)
                    new_blocks[x + y * world.width] = world.blocks[x + y * world.width]

            for (let x = 0; x < world.width; x++) {
                for (let y = world.height; y < new_height; y++) {
                    let block = new Block(x, y)
                    block.build_mesh(edit.gl)
                    new_blocks[x + y * world.width] = block
                }
            }

            world.blocks = new_blocks
            world.height = new_height

            for (let x = 0; x < world.width; x++)
                for (let y = 0; y < world.height; y++)
                    world.global_blocks[x + "/" + y] = world.blocks[x + y * world.width]
        }

        let bx = Math.floor(px * INV_GRID_SIZE)
        let by = Math.floor(py * INV_GRID_SIZE)
        let tx = Math.floor(px * INV_TILE_SIZE) % BLOCK_SIZE
        let ty = Math.floor(py * INV_TILE_SIZE) % BLOCK_SIZE

        let block = world.blocks[bx + by * world.width]
        let index = tx + ty * BLOCK_SIZE
        let existing = block.tiles[index]

        if (tile !== existing) {
            block.tiles[index] = tile
            block.build_mesh(edit.gl)
            edit.render()
        }
    }
    static AddThing(edit, id) {
        let px = edit.mouse_to_world_x()
        if (px < 0 || px >= edit.world.width * GRID_SIZE) return
        let py = edit.mouse_to_world_y()
        if (py < 0 || py >= edit.world.height * GRID_SIZE) return

        let bx = Math.floor(px * INV_GRID_SIZE)
        let by = Math.floor(py * INV_GRID_SIZE)
        let tx = Math.floor(px * INV_TILE_SIZE) % BLOCK_SIZE
        let ty = Math.floor(py * INV_TILE_SIZE) % BLOCK_SIZE

        // TODO: head of thing out of bounds -> expand map

        let block = edit.world.blocks[bx + by * edit.world.width]
        let tile = block.tiles[tx + ty * BLOCK_SIZE]

        while (TILE_EMPTY[tile]) {
            ty -= 1
            if (ty < 0) {
                ty += BLOCK_SIZE
                by -= 1
                if (by === -1)
                    return
                block = edit.world.blocks[bx + by * edit.world.width]
            }
            tile = block.tiles[tx + ty * BLOCK_SIZE]
        }

        py = (ty + 1 + by * BLOCK_SIZE) * TILE_SIZE

        if (id === "skeleton")
            new Skeleton(edit.world, px, py)
        else if (id === "you")
            new You(edit.world, px, py)

        edit.render()
    }
}