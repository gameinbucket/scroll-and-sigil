const BUTTON_SIZE = 32
class EditForm {
    constructor(uid, x, y, width, height, red, green, blue) {
        this.uid = uid
        this.x_pos = x
        this.y_pos = y
        this.w_pos = width
        this.h_pos = height
        this.x
        this.y
        this.width
        this.height
        this.red = red / 256.0
        this.green = green / 256.0
        this.blue = blue / 256.0
    }
    resize(forms, frame) {
        if (this.x_pos.endsWith("%"))
            this.x = Math.floor(frame.width * parseInt(this.x_pos.substring(0, this.x_pos.length - 1)))
        else if (this.x_pos.startsWith("same$")) {
            let parent = forms.get(this.x_pos.substring(5))
            this.x = parent.x + parent.width
        } else
            this.x = parseInt(this.x_pos)

        if (this.w_pos.endsWith("%"))
            this.width = Math.floor(frame.width * parseInt(this.w_pos.substring(0, this.w_pos.length - 1)))
        else if (this.w_pos.startsWith("same$")) {
            let parent = forms.get(this.w_pos.substring(5))
            this.width = parent.width
        } else if (this.w_pos === "fill")
            this.width = frame.width - this.x
        else
            this.width = parseInt(this.w_pos)

        if (this.y_pos.endsWith("%"))
            this.y = Math.floor(frame.height * parseInt(this.y_pos.substring(0, this.y_pos.length - 1)))
        else if (this.y_pos.startsWith("same$")) {
            let parent = forms.get(this.y_pos.substring(5))
            this.y = parent.y + parent.height
        } else if (this.y_pos === "top") {} else
            this.y = parseInt(this.y_pos)

        if (this.h_pos.endsWith("%"))
            this.height = Math.floor(frame.height * parseInt(this.h_pos.substring(0, this.h_pos.length - 1)))
        else if (this.h_pos.startsWith("same$")) {
            let parent = forms.get(this.h_pos.substring(5))
            this.height = parent.height
        } else if (this.h_pos.startsWith("to$")) {
            let parent = forms.get(this.h_pos.substring(3))
            this.height = parent.y
        } else if (this.h_pos === "fill")
            this.height = frame.height - this.y
        else if (this.h_pos === "min")
            this.height = this.min_height()
        else
            this.height = parseInt(this.h_pos)

        if (this.y_pos === "top")
            this.y = frame.height - this.height
    }
    min_height() {}
    inside(x, y) {
        return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
    }
    on() {}
    nop() {}
    drag() {}
    clear(gl) {
        gl.scissor(this.x, this.y, this.width, this.height)
        gl.clearColor(this.red, this.green, this.blue, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }
    draw() {}
}

class EditMain extends EditForm {
    constructor(uid, x, y, width, height, red, green, blue) {
        super(uid, x, y, width, height, red, green, blue)
        this.select = "world"
    }
    min_height() {
        return BUTTON_SIZE
    }
    draw(gl, sprite_buffer) {
        this.clear(gl)
        let icons = [
            "save",
            "load",
            "world",
            "camera"
        ]
        let x = this.x
        for (let key in icons) {
            let icon = icons[key]
            let sprite = SPRITE_DATA["buttons"][icon]
            let w = BUTTON_SIZE
            let h = BUTTON_SIZE
            let y = this.y + this.height - h
            Render.Image(sprite_buffer["buttons"], x, y, w, h, sprite.left, sprite.top, sprite.right, sprite.bottom)
            x += w
        }
    }
    on(edit, x, y) {
        let local_x = x - this.x
        let local_y = this.height - (y - this.y)

        let gx = Math.floor(local_x / BUTTON_SIZE)
        let gy = Math.floor(local_y / BUTTON_SIZE)

        if (gy === 0) {
            if (gx === 0) {
                if (edit.cli_input !== "") {
                    let data = edit.world.save(edit.cli_input)
                    edit.cli_input = ""
                    Network.Send("api/store/save", data)
                } else
                    console.log("Please name map")
            } else if (gx === 1) {
                if (edit.cli_input !== "") {
                    Network.Request("maps/" + edit.cli_input + ".json").then(function (data) {
                        edit.world.load(data)
                        edit.render()
                    }).catch(function (data) {
                        console.log(data)
                    })
                    edit.cli_input = ""
                } else
                    console.log("Please name map")
            } else if (gx === 2) {} else if (gx === 3) {
                this.select = "camera"
                return true
            }
        }

        return false
    }
    drag(edit) {
        if (this.select === "camera") {
            edit.camera.x += edit.mouse_previous_x - edit.mouse_x
            edit.camera.y += edit.mouse_previous_y - edit.mouse_y
            if (edit.camera.x < 0) edit.camera.x = 0
            else if (edit.camera.x > edit.world.width * GRID_SIZE) edit.camera.x = edit.world.width * GRID_SIZE
            if (edit.camera.y < 0) edit.camera.y = 0
            else if (edit.camera.y > edit.world.height * GRID_SIZE) edit.camera.y = edit.world.height * GRID_SIZE
            edit.render()
        }
    }
}

class EditFolder extends EditForm {
    constructor(uid, x, y, width, height, red, green, blue) {
        super(uid, x, y, width, height, red, green, blue)
        this.menu = "world"
        this.select = "tiles"
    }
    draw(gl, sprite_buffer) {
        this.clear(gl)

        let size = 2
        let x = this.x + 10
        let y = this.y + this.height - FONT_HEIGHT * size - Math.floor((BUTTON_SIZE - FONT_HEIGHT * size) * 0.5)
        Render.Print(sprite_buffer["font"], "tiles", x, y, size)

        y -= BUTTON_SIZE
        Render.Print(sprite_buffer["font"], "things", x, y, size)
    }
    on(edit, x, y) {
        let local_y = this.height - (y - this.y)
        let gy = Math.floor(local_y / BUTTON_SIZE)

        if (this.menu === "world") {
            if (gy < 2) {
                if (gy === 0) this.select = "tiles"
                else if (gy === 1) this.select = "things"
                edit.forms.get("world").menu = this.select
                edit.render()
            }
        }

        return false
    }
}

class EditWorld extends EditForm {
    constructor(uid, x, y, width, height, red, green, blue) {
        super(uid, x, y, width, height, red, green, blue)
        this.menu = "tiles"
        this.tile_select = TILE_WALL
        this.thing_select = "skeleton"
        this.thing = null
    }
    min_height() {
        return BUTTON_SIZE
    }
    draw(gl, sprite_buffer) {
        this.clear(gl)
        let x = this.x
        let y = this.y + this.height - BUTTON_SIZE
        let sprite = SPRITE_DATA["buttons"]["eraser"]
        Render.Image(sprite_buffer["buttons"], x, y, BUTTON_SIZE, BUTTON_SIZE, sprite.left, sprite.top, sprite.right, sprite.bottom)
        x += BUTTON_SIZE
        if (this.menu === "tiles") {
            for (let i in TILE_LIST) {
                let tile = TILE_LIST[i]
                sprite = SPRITE_DATA["map"][tile]
                Render.Image(sprite_buffer["map"], x, y, BUTTON_SIZE, BUTTON_SIZE, sprite.left, sprite.top, sprite.right, sprite.bottom)
                x += BUTTON_SIZE
            }
        } else if (this.menu === "things") {
            let sprite = SPRITE_DATA["buttons"]["camera"]
            Render.Image(sprite_buffer["buttons"], x, y, BUTTON_SIZE, BUTTON_SIZE, sprite.left, sprite.top, sprite.right, sprite.bottom)
            x += BUTTON_SIZE

            for (let i in THING_LIST) {
                let thing = THING_LIST[i]
                let texture = thing["texture"]
                let animation = thing["animation"]
                let sprite = SPRITE_DATA[texture][animation]
                let w = BUTTON_SIZE
                let h = BUTTON_SIZE
                let y = this.y + this.height - h
                Render.Image(sprite_buffer[texture], x, y, w, h, sprite.left, sprite.top, sprite.right, sprite.bottom)
                x += w
            }
        }
    }
    on(_, x, y) {
        let local_x = x - this.x
        let local_y = this.height - (y - this.y)

        let gx = Math.floor(local_x / BUTTON_SIZE)
        let gy = Math.floor(local_y / BUTTON_SIZE)

        if (gy === 0) {
            if (this.menu === "tiles") {
                if (gx < TILE_LIST.length + 1) {
                    this.tile_select = gx
                    return true
                }
            } else if (this.menu === "things") {
                if (gx === 0) {
                    this.thing_select = "eraser"
                    return true
                } else if (gx === 1) {
                    this.thing_select = "move"
                    return true
                } else {
                    gx -= 2
                    if (gx < THING_LIST.length) {
                        this.thing_select = THING_LIST[gx]
                        return true
                    }
                }
            }
        }

        return false
    }
    nop(edit) {
        if (this.menu === "tiles")
            Editing.SetTile(edit, this.tile_select)
        else if (this.menu === "things") {
            if (this.thing_select === "eraser") Editing.RemoveThing(edit)
            else if (this.thing_select === "move") Editing.SelectThing(edit)
            else Editing.AddThing(edit, this.thing_select)
        }
    }
    drag(edit) {
        if (this.menu === "tiles")
            Editing.SetTile(edit, this.tile_select)
        else if (this.menu === "things") {
            if (this.thing_select === "eraser") Editing.RemoveThing(edit)
            else if (this.thing_select === "move") Editing.MoveThing(edit)
        }
    }
}