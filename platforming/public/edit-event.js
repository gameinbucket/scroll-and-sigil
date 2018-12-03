class Editing {
    static InitButtons(self) {
        // let left_buttons = [
        //     new Button(self, "buttons", "menu", (button) => {

        //     }),
        //     new Button(self, "buttons", "save", (button) => {
        //         self.edit_save()
        //     }),
        //     new Button(self, "buttons", "load", (button) => {
        //         if (self.cli_input !== "") {
        //             Network.Send("api/store/load", this.cli_input).then(function (data) {
        //                 self.world.load(data)
        //                 self.render()
        //             }).catch(function (data) {
        //                 console.log(data)
        //             })
        //         }
        //     }),
        //     new Button(self, "buttons", "regular", (button) => {
        //         if (!button.active) {
        //             button.active = true
        //             self.active_buttons.push(button)
        //             let buttons = [
        //                 new Button(self, "map", "wall", (x) => {
        //                     if (!x.active) {
        //                         x.active = true
        //                         delete self.buttons["select.tile"]
        //                         self.active_buttons = []
        //                         self.active_buttons.push(x)
        //                         self.render()
        //                     }
        //                 }, (x) => {
        //                     // deactivate
        //                 }, (x) => {
        //                     self.edit_set_tile(TILE_GROUND)
        //                 }),
        //                 new Button(self, "map", "ground", (x) => {
        //                     self.tile_select = TILE_GROUND
        //                 }),
        //                 new Button(self, "map", "rail", (button) => {
        //                     self.tile_select = TILE_RAIL
        //                 }),
        //                 new Button(self, "map", "stairs-right", (button) => {
        //                     self.tile_select = TILE_STAIRS_RIGHT
        //                 }),
        //                 new Button(self, "you", "idle", (button) => {}),
        //             ]
        //             for (let index = 0; index < buttons.length; index++) {
        //                 let x = buttons[index]
        //                 x.put(40 + (32 + 5) * index, self.frame.height - 100)
        //             }
        //             self.buttons["select.tile"] = buttons
        //             self.render()
        //         }
        //     }),

        //     // new Button(self, "buttons", "regular", "add.block"), // TODO
        //     // new Button(self, "buttons", "regular", "remove.block"), // TODO

        //     // new Button(self, "eraser", "eraser", btn, btn),
        //     // new Button(self, "ground", "add.ground", btn, btn),
        //     // new Button(self, "wall", "add.wall", btn, btn),
        //     // new Button(self, "rail", "add.rail", btn, btn),
        //     // new Button(self, "you", "add.you", btn, btn),
        //     // new Button(self, "skeleton", "add.skeleton", btn, btn)
        // ]

        // let right_buttons = [new Button(self, "buttons", "menu", (button) => {
        //     if (!button.active) {
        //         button.active = true
        //         self.active_buttons.push(button)
        //         self.render()
        //     }
        // }, (button) => {
        //     button.active = false
        //     self.active_buttons.splice(self.active_buttons.indexOf(button), 1)
        // }, (_) => {
        //     // on
        // }, (_) => {
        //     self.camera.x += self.mouse_previous_x - self.mouse_x
        //     self.camera.y += self.mouse_previous_y - self.mouse_y
        //     if (self.camera.x < 0) self.camera.x = 0
        //     else if (self.camera.x > self.world.width * GRID_SIZE) self.camera.x = self.world.width * GRID_SIZE
        //     if (self.camera.y < 0) self.camera.y = 0
        //     else if (self.camera.y > self.world.height * GRID_SIZE) self.camera.y = self.world.height * GRID_SIZE
        //     self.render()
        // })]

        // self.buttons["right"] = right_buttons
        // self.buttons["left"] = left_buttons
    }
    static SetTile(edit, tile) {
        let px = edit.mouse_to_world_x()
        let py = edit.mouse_to_world_y()

        let world = edit.world

        if (px < 0) {
            // px = -px
            // let set_bx = Math.floor(px * INV_GRID_SIZE) + 1

            // let world = edit.world

            // let new_width = world.width + set_bx
            // let new_blocks = new Array(new_width * world.height)

            // console.log(">>>", px, set_bx, ">", world.width, ">", new_width)

            // for (let bx = set_bx; bx < new_blocks; bx++) {
            //     for (let by = 0; by < world.height; by++) {
            //         console.log(bx, by, set_bx)
            //         new_blocks[bx + by * world.width] = world.blocks[bx - set_bx + by * world.width]
            //     }
            // }

            // world.blocks = new_blocks
            // world.width = new_width

            // for (let bx = 0; bx < world.width; bx++) {
            //     for (let by = 0; by < world.height; by++) {
            //         world.global_blocks[bx + "/" + by] = world.blocks[bx + by * world.width]
            //     }
            // }
            return
        } else if (px >= world.width * GRID_SIZE) {
            let bx = Math.floor(px * INV_GRID_SIZE)
            let new_width = bx
            let new_blocks = []

            for (let bx = 0; bx < world.width; bx++)
                for (let by = 0; by < world.height; by++)
                    new_blocks[bx + by * new_width] = world.blocks[bx + by * world.width]

            for (let bx = world.width; bx < new_width; bx++)
                for (let by = 0; by < world.height; by++)
                    new_blocks[bx + by * new_width] = new Block(bx, by)

            console.log("NEW >>>", new_blocks)

            world.blocks = new_blocks
            world.width = new_width

            for (let bx = 0; bx < world.width; bx++) {
                for (let by = 0; by < world.height; by++) {
                    world.global_blocks[bx + "/" + by] = world.blocks[bx + by * world.width]
                }
            }
        }

        if (py < 0) {
            return
        } else if (py >= world.height * GRID_SIZE) {
            return
        }

        console.log(world.blocks)

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

        // TODO: head of thing out of bounds

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