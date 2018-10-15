class Application {
    configure_opengl(gl) {
        gl.clearColor(0, 0, 0, 1)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.SCISSOR_TEST)
    }
    load_programs(g, gl) {
        g.make_program(gl, "texture")
    }
    load_images(g, gl) {
        g.make_image(gl, "map", gl.CLAMP_TO_EDGE)
        g.make_image(gl, "font", gl.CLAMP_TO_EDGE)
        g.make_image(gl, "buttons", gl.CLAMP_TO_EDGE)
        g.make_image(gl, "you", gl.CLAMP_TO_EDGE)
        g.make_image(gl, "skeleton", gl.CLAMP_TO_EDGE)
    }
    resize() {
        let gl = this.gl
        let canvas = this.canvas
        let screen = this.screen

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let canvas_ortho = Matrix.Make()
        let draw_ortho = Matrix.Make()

        let scale = 1.0
        let draw_width = canvas.width * scale
        let draw_height = canvas.height * scale

        Matrix.Orthographic(draw_ortho, 0.0, draw_width, 0.0, draw_height, 0.0, 1.0)
        Matrix.Orthographic(canvas_ortho, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)

        let frame = new FrameBuffer(gl, draw_width, draw_height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], false, true)

        screen.zero()
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

        this.frame = frame
        this.canvas_ortho = canvas_ortho
        this.draw_ortho = draw_ortho
    }
    constructor() {
        let self = this

        let canvas = document.createElement("canvas")
        canvas.style.display = "block"
        canvas.style.position = "absolute"
        canvas.style.left = "0"
        canvas.style.right = "0"
        canvas.style.top = "0"
        canvas.style.bottom = "0"
        canvas.style.margin = "auto"
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let gl = canvas.getContext("webgl2")
        let g = new RenderSystem()

        this.configure_opengl(gl)
        this.load_programs(g, gl)
        this.load_images(g, gl)

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 6400, 9600)
        let sprite_buffers = new Map()
        sprite_buffers["you"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffers["skeleton"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let sprites = new Map()
        let inv = 1.0 / 128.0

        sprites["map"] = new Map()
        sprites["map"]["dirt"] = new Sprite(0, 0, TILE_SIZE, TILE_SIZE, inv)

        sprites["buttons"] = new Map()
        sprites["buttons"]["menu"] = new Sprite(0, 0, 32, 32, inv, inv)
        sprites["buttons"]["save"] = new Sprite(1 * 33, 0, 32, 32, inv, inv)
        sprites["buttons"]["load"] = new Sprite(2 * 33, 0, 32, 32, inv, inv)
        sprites["buttons"]["eraser"] = new Sprite(0, 1 * 33, 32, 32, inv, inv)
        sprites["buttons"]["ground"] = new Sprite(1 * 33, 1 * 33, 32, 32, inv, inv)
        sprites["buttons"]["wall"] = new Sprite(2 * 33, 1 * 33, 32, 32, inv, inv)
        sprites["buttons"]["rail"] = new Sprite(0, 2 * 33, 32, 32, inv, inv)
        sprites["buttons"]["you"] = new Sprite(1 * 33, 2 * 33, 32, 32, inv, inv)
        sprites["buttons"]["skeleton"] = new Sprite(2 * 33, 2 * 33, 32, 32, inv, inv)

        sprites["you"] = new Map()
        sprites["you"]["walk"] = [new Sprite(0, 0, 16, 30, inv)]

        sprites["skeleton"] = new Map()
        sprites["skeleton"]["walk"] = [new Sprite(0, 0, 16, 31, inv)]

        let world = new World()
        Network.Request("resources/map.json", (data) => {
            world.load(gl, sprites, data)
            self.camera.y = 0.5 * world.block_h * GRID_SIZE
        })

        window.onresize = function () {
            self.resize()
            self.render()
        }

        document.onkeyup = key_up
        document.onkeydown = key_down
        document.onmouseup = mouse_up
        document.onmousedown = mouse_down
        document.onmousemove = mouse_move
        document.oncontextmenu = function () {
            return false
        }

        let btn = 32
        let pad = 10
        let buttons = [
            new Button(this, sprites["buttons"]["menu"], "menu", pad, pad, btn, btn),
            new Button(this, sprites["buttons"]["save"], "save", pad, pad + 1 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["load"], "load", pad, pad + 2 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["eraser"], "eraser", pad, pad + 3 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["ground"], "add.ground", pad, pad + 4 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["wall"], "add.wall", pad, pad + 5 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["rail"], "add.rail", pad, pad + 6 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["you"], "add.you", pad, pad + 7 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["skeleton"], "add.skeleton", pad, pad + 8 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["menu"], "move.cam", pad, pad + 9 * (btn + pad), btn, btn),
            // new Button(this, sprites["buttons"]["skeleton"], "thing.conditions", pad + 1 * (btn + pad), pad, btn, btn),
            // new Button(this, sprites["buttons"]["skeleton"], "thing.script", pad + 1 * (btn + pad), pad, btn, btn),
        ]

        this.cli_input = ""
        this.on = true
        this.mouse_x = null
        this.mouse_y = null
        this.mouse_previous_x = null
        this.mouse_previous_y = null
        this.mouse_left = false
        this.action = null
        this.canvas = canvas
        this.screen = screen
        this.sprites = sprites
        this.sprite_buffers = sprite_buffers
        this.gl = gl
        this.g = g
        this.generic = generic
        this.world = world
        this.buttons = buttons
        this.form = null
        this.resize()
        this.camera = {
            x: 0.5 * GRID_SIZE,
            y: 0
        }
    }
    key_up(event) {}
    key_down(event) {
        let key = String.fromCharCode(event.keyCode);
        if (/[a-zA-Z0-9-_ ]/.test(key)) {
            this.cli_input += event.key
            this.render()
        }
    }
    mouse_up(event) {
        if (event.button !== 0)
            return
        this.mouse_left = false
    }
    mouse_down(event) {
        if (event.button !== 0)
            return
        this.mouse_left = true

        if (this.mouse_x < 52 || this.mouse_y < 52) {
            for (let i = 0; i < this.buttons.length; i++) {
                let button = this.buttons[i]
                if (button.click(this.mouse_x, this.mouse_y)) {
                    this.edit_next_action(button.action)
                    break
                }
            }
        } else
            this.edit_action_on()
    }
    edit_next_action(action) {
        switch (action) {
            case "save":
                let save = this.world.save()
                console.log(save)
                localStorage.setItem("world", save)
                Network.Post("save", save, () => {})
                this.render()
                break
            case "load":
                let loading = localStorage.getItem("world")
                if (loading === null) break
                this.world.load(this.gl, this.sprites, loading)
                this.render()
                break
            case "menu":
                break
            default:
                this.action = action
        }
    }
    edit_action_on() {
        switch (this.action) {
            case "eraser":
                this.edit_set_tile(TILE_NONE)
                break
            case "add.ground":
                this.edit_set_tile(TILE_GROUND)
                break
            case "add.wall":
                this.edit_set_tile(TILE_WALL)
                break
            case "add.rail":
                this.edit_set_tile(TILE_RAIL)
                break
            case "add.you":
                this.edit_add_thing("you")
                break
            case "add.skeleton":
                this.edit_add_thing("skeleton")
                break
        }
    }
    edit_action_move() {
        switch (this.action) {
            case "eraser":
                this.edit_set_tile(TILE_NONE)
                break
            case "add.ground":
                this.edit_set_tile(TILE_GROUND)
                break
            case "add.wall":
                this.edit_set_tile(TILE_WALL)
                break
            case "add.rail":
                this.edit_set_tile(TILE_RAIL)
                break
            case "move.cam":
                this.camera.x += this.mouse_previous_x - this.mouse_x
                this.camera.y += this.mouse_previous_y - this.mouse_y
                if (this.camera.x < 0) this.camera.x = 0
                else if (this.camera.x > this.world.block_w * GRID_SIZE) this.camera.x = this.world.block_w * GRID_SIZE
                if (this.camera.y < 0) this.camera.y = 0
                else if (this.camera.y > this.world.block_h * GRID_SIZE) this.camera.y = this.world.block_h * GRID_SIZE
                this.render()
                break
        }
    }
    mouse_move(event) {
        this.mouse_previous_x = this.mouse_x
        this.mouse_previous_y = this.mouse_y
        this.mouse_x = event.clientX
        this.mouse_y = this.canvas.height - event.clientY
        if (this.mouse_left)
            this.edit_action_move()
    }
    mouse_to_world_x() {
        return this.mouse_x + this.camera.x - this.canvas.width * 0.5
    }
    mouse_to_world_y() {
        return this.mouse_y + this.camera.y - this.canvas.height * 0.5
    }
    edit_add_thing(id) {
        let px = this.mouse_to_world_x()
        if (px < 0 || px >= this.world.block_w * GRID_SIZE) return
        let py = this.mouse_to_world_y()
        if (py < 0 || py >= this.world.block_h * GRID_SIZE) return
        new Thing(this.world, id, this.sprites[id], px, py)
        this.render()
    }
    edit_set_tile(tile) {
        let px = this.mouse_to_world_x()
        if (px < 0 || px >= this.world.block_w * GRID_SIZE) return
        let py = this.mouse_to_world_y()
        if (py < 0 || py >= this.world.block_h * GRID_SIZE) return

        let bx = Math.floor(px * INV_GRID_SIZE)
        let by = Math.floor(py * INV_GRID_SIZE)
        let tx = Math.floor(px * INV_TILE_SIZE) % BLOCK_SIZE
        let ty = Math.floor(py * INV_TILE_SIZE) % BLOCK_SIZE

        let block = this.world.blocks[bx + by * this.world.block_w]
        let index = tx + ty * BLOCK_SIZE
        let existing = block.tiles[index]

        if (tile !== existing) {
            block.tiles[index] = tile
            block.build_mesh(this.gl)
            this.render()
        }
    }
    run() {
        for (let key in this.g.shaders) {
            if (this.g.shaders[key] === null) {
                setTimeout(run, 500)
                return
            }
        }
        for (let key in this.g.textures) {
            if (this.g.textures[key] === null) {
                setTimeout(run, 500)
                return
            }
        }
        document.body.appendChild(this.canvas)
        this.render()
    }
    render() {
        let g = this.g
        let gl = this.gl
        let frame = this.frame
        let camera = this.camera
        let buttons = this.buttons
        let generic = this.generic

        let view_x = -Math.floor(camera.x - frame.width * 0.5)
        let view_y = -Math.floor(camera.y - frame.height * 0.5)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)

        gl.clearColor(0, 0, 0, 1)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        g.set_program(gl, "texture")
        g.set_orthographic(this.draw_ortho, view_x, view_y)
        g.update_mvp(gl)
        this.world.render(g, gl, frame, camera.x, camera.y, this.sprite_buffers)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, this.screen)

        gl.clearColor(0.5, 0.5, 0.5, 1)
        RenderSystem.SetView(gl, 0, 0, 52, this.canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height)

        g.set_program(gl, "texture")
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl)
        generic.zero()
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].draw(generic)
        }
        g.set_texture(gl, "buttons")
        RenderSystem.UpdateAndDraw(gl, generic)

        generic.zero()
        Render.Print(generic, this.cli_input, 62, 50, 2)
        g.set_texture(gl, "font")
        RenderSystem.UpdateAndDraw(gl, generic)

        if (this.form !== null)
            this.form.render(g, gl, generic)
    }
}

let app = new Application()
app.run()

function run() {
    app.run()
}

function key_up(event) {
    app.key_up(event)
}

function key_down(event) {
    app.key_down(event)
}

function mouse_up(event) {
    app.mouse_up(event)
}

function mouse_down(event) {
    app.mouse_down(event)
}

function mouse_move(event) {
    app.mouse_move(event)
}