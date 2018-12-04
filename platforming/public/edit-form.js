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
        if (this.x_pos.endsWith("%")) this.x = Math.floor(frame.width * parseInt(this.x_pos.substring(0, this.x_pos.length - 1)))
        else if (this.x_pos.startsWith("uid$")) {
            let parent = forms.get(this.x_pos.substring(4))
            this.x = parent.x + parent.width
        } else this.x = parseInt(this.x_pos)

        if (this.w_pos.endsWith("%")) this.width = Math.floor(frame.width * parseInt(this.w_pos.substring(0, this.w_pos.length - 1)))
        else if (this.w_pos === "fill") this.width = frame.width - this.x
        else this.width = parseInt(this.w_pos)

        if (this.y_pos.endsWith("%")) this.y = Math.floor(frame.height * parseInt(this.y_pos.substring(0, this.y_pos.length - 1)))
        else if (this.y_pos.startsWith("uid$")) {
            let parent = forms[this.y_pos.substring(4)]
            this.y = parent.y + parent.height
        } else this.y = parseInt(this.y_pos)

        if (this.h_pos.endsWith("%")) this.height = Math.floor(frame.height * parseInt(this.h_pos.substring(0, this.h_pos.length - 1)))
        else if (this.h_pos === "fill") this.height = frame.height - this.y
        else this.height = parseInt(this.h_pos)
    }
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
            let sprite = SPRITES["buttons"][icon][0]
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
            if (gx === 0) edit.forms.get("world").menu = "tiles"
            else if (gx === 1) edit.forms.get("world").menu = "things"
            else if (gx === 3) {
                this.select = "camera"
                return true
            }
            edit.render()
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

class EditWorld extends EditForm {
    constructor(uid, x, y, width, height, red, green, blue) {
        super(uid, x, y, width, height, red, green, blue)
        this.menu = "tiles"
        this.tile_select = TILE_WALL
        this.thing_select = "skeleton"
    }
    draw(gl, sprite_buffer) {
        this.clear(gl)

        let x = this.x

        if (this.menu === "tiles") {
            for (let key in TILE_LIST) {
                let tile = TILE_LIST[key]
                let sprite = SPRITES["map"][tile][0]
                let w = BUTTON_SIZE
                let h = BUTTON_SIZE
                let y = this.y + this.height - h
                Render.Image(sprite_buffer["map"], x, y, w, h, sprite.left, sprite.top, sprite.right, sprite.bottom)
                x += w
            }
        } else if (this.menu === "things") {
            for (let _ in THING_LIST) {
                let sprite = SPRITES["map"]["wall"][0]
                let w = BUTTON_SIZE
                let h = BUTTON_SIZE
                let y = this.y + this.height - h
                Render.Image(sprite_buffer["map"], x, y, w, h, sprite.left, sprite.top, sprite.right, sprite.bottom)
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
                if (gx < TILE_LIST.length) {
                    this.tile_select = gx + 1
                    return true
                }
            } else if (this.menu === "things") {
                if (gx < THING_LIST.length) {
                    this.thing_select = THING_LIST[gx]
                    return true
                }
            }
        }

        return false
    }
    nop(edit) {
        if (this.menu === "tiles")
            Editing.SetTile(edit, this.tile_select) // TODO: add fill block with tile option
        else if (this.menu === "things")
            Editing.AddThing(edit, this.thing_select)
    }
    drag(edit) {
        this.nop(edit)
    }
}