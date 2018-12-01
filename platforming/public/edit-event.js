class Editing {
    static InitButtons(self) {
        let left_buttons = [
            new Button(self, "buttons", "menu", (button) => {

            }),
            new Button(self, "buttons", "save", (button) => {
                self.edit_save()
            }),
            new Button(self, "buttons", "load", (button) => {
                if (self.cli_input !== "") {
                    Network.Send("api/store/load", this.cli_input).then(function (data) {
                        self.world.load(data)
                        self.render()
                    }).catch(function (data) {
                        console.log(data)
                    })
                }
            }),
            new Button(self, "buttons", "regular", (button) => {
                if (!button.active) {
                    button.active = true
                    self.active_buttons.push(button)
                    let buttons = [
                        new Button(self, "map", "wall", (x) => {
                            if (!x.active) {
                                x.active = true
                                delete self.buttons["select.tile"]
                                self.active_buttons = []
                                self.active_buttons.push(x)
                                self.render()
                            }
                        }, (x) => {
                            // deactivate
                        }, (x) => {
                            self.edit_set_tile(TILE_GROUND)
                        }),
                        new Button(self, "map", "ground", (x) => {
                            self.tile_select = TILE_GROUND
                        }),
                        new Button(self, "map", "rail", (button) => {
                            self.tile_select = TILE_RAIL
                        }),
                        new Button(self, "map", "stairs-right", (button) => {
                            self.tile_select = TILE_STAIRS_RIGHT
                        }),
                        new Button(self, "you", "idle", (button) => {}),
                    ]
                    for (let index = 0; index < buttons.length; index++) {
                        let x = buttons[index]
                        x.put(40 + (32 + 5) * index, self.frame.height - 100)
                    }
                    self.buttons["select.tile"] = buttons
                    self.render()
                }
            }),

            // new Button(self, "buttons", "regular", "add.block"), // TODO
            // new Button(self, "buttons", "regular", "remove.block"), // TODO

            // new Button(self, "eraser", "eraser", btn, btn),
            // new Button(self, "ground", "add.ground", btn, btn),
            // new Button(self, "wall", "add.wall", btn, btn),
            // new Button(self, "rail", "add.rail", btn, btn),
            // new Button(self, "you", "add.you", btn, btn),
            // new Button(self, "skeleton", "add.skeleton", btn, btn)
        ]

        let right_buttons = [new Button(self, "buttons", "menu", (button) => {
            if (!button.active) {
                button.active = true
                self.active_buttons.push(button)
                self.render()
            }
        }, (button) => {
            button.active = false
            self.active_buttons.splice(self.active_buttons.indexOf(button), 1)
        }, (_) => {
            // on
        }, (_) => {
            self.camera.x += self.mouse_previous_x - self.mouse_x
            self.camera.y += self.mouse_previous_y - self.mouse_y
            if (self.camera.x < 0) self.camera.x = 0
            else if (self.camera.x > self.world.width * GRID_SIZE) self.camera.x = self.world.width * GRID_SIZE
            if (self.camera.y < 0) self.camera.y = 0
            else if (self.camera.y > self.world.height * GRID_SIZE) self.camera.y = self.world.height * GRID_SIZE
            self.render()
        })]

        self.buttons["right"] = right_buttons
        self.buttons["left"] = left_buttons
    }
}