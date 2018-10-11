class Application {
    configure_opengl(gl) {
        gl.clearColor(0, 0, 0, 1)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
    }
    load_programs(g, gl) {
        g.make_program(gl, "texture")
    }
    load_images(g, gl) {
        g.make_image(gl, "map", gl.CLAMP_TO_EDGE)
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

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 1600, 2400)
        let sprite_buffers = new Map()
        sprite_buffers["you"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffers["skeleton"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let s = 16.0
        let w = 1.0 / 128.0
        let h = 1.0 / 128.0
        let sprite_cavern = new Map()
        sprite_cavern["dirt"] = new Sprite(1 + 17 * 0, 1 + 17 * 0, s, s, w, h, 0, 0)
        sprite_cavern["dirt light"] = new Sprite(1 + 17 * 0, 1 + 17 * 1, s, s, w, h, 0, 0)
        sprite_cavern["dirt lightest"] = new Sprite(1 + 17 * 0, 1 + 17 * 2, s, s, w, h, 0, 0)
        sprite_cavern["wall"] = new Sprite(1 + 17 * 1, 1 + 17 * 0, s, s, w, h, 0, 0)
        sprite_cavern["wall edge"] = new Sprite(1 + 17 * 1, 1 + 17 * 1, s, s, w, h, 0, 0)
        sprite_cavern["wall corner"] = new Sprite(1 + 17 * 1, 1 + 17 * 2, s, s, w, h, 0, 0)
        sprite_cavern["stone floor"] = new Sprite(1 + 17 * 1, 1 + 17 * 3, s, s, w, h, 0, 0)

        let you_walk = [new Sprite(0, 0, 16, 30, 1.0 / 16.0, 1.0 / 30.0, 0, 0)]
        let skeleton_walk = [new Sprite(0, 0, 16, 31, 1.0 / 16.0, 1.0 / 31.0, 0, 0)]

        let world = new World(8, 3)
        world.build(gl)

        window.onresize = function () {
            self.resize()
        }

        document.onkeyup = key_up
        document.onkeydown = key_down
        document.onmouseup = mouse_up
        document.onmousedown = mouse_down
        document.onmousemove = mouse_move

        let buttons = [
            new Button(this, sprite_cavern["dirt"], "add.grass", 10, 10, 32, 32),
            new Button(this, sprite_cavern["wall"], "add.dirt", 52, 10, 32, 32),
            new Button(this, sprite_cavern["stone floor"], "nothing", 94, 10, 32, 32)
        ]

        this.action = null
        this.canvas = canvas
        this.screen = screen
        this.sprite_buffers = sprite_buffers
        this.on = true
        this.gl = gl
        this.g = g
        this.generic = generic
        this.world = world
        this.sprite_cavern = sprite_cavern
        this.buttons = buttons
        this.camera = {
            x: 200,
            y: 200
        }

        this.resize()
    }
    key_up(event) {}
    key_down(event) {}
    mouse_up(event) {
        if (event.button === 0) this.mouse_left = false
        else if (event.button === 2) this.mouse_right = false
    }
    mouse_down(event) {
        if (event.button === 0) this.mouse_left = true
        else if (event.button === 2) this.mouse_right = true

        let action = null;
        let buttons = this.buttons
        let x = this.mouse_x
        let y = this.mouse_y

        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i]
            if (button.click(x, y)) {
                action = button.action
                break
            }
        }

        if (action === null) {

            let gx = Math.floor((x + this.camera.x - this.canvas.width * 0.5) * INV_TILE_SIZE)
            let gy = Math.floor((y + this.camera.y - this.canvas.height * 0.5) * INV_TILE_SIZE)

            let bx = Math.floor((x + this.camera.x - this.canvas.width * 0.5) * INV_GRID_SIZE)
            let by = Math.floor((y + this.camera.y - this.canvas.height * 0.5) * INV_GRID_SIZE)

            console.log(x, y, gx, gy, bx, by)

            switch (this.action) {
                case "add.grass":
                    this.world.set_tile(gx, gy, TILE_GRASS)
                    this.world.get_block(bx, by).build_mesh(this.gl)
                    this.render()
                    break
            }
        } else
            this.action = action
    }
    mouse_move(event) {
        this.mouse_x = event.clientX
        this.mouse_y = this.canvas.height - event.clientY
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

        g.set_program(gl, "texture");
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl);
        generic.zero();
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].draw(generic);
        }
        g.set_texture(gl, "map");
        RenderSystem.UpdateAndDraw(gl, generic);
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