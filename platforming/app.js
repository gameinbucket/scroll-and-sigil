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

        let scale = 0.5
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
        let you_walk = new Sprite(18, 0, 12, 31, inv)
        sprites["you"]["walk"] = [new Sprite(0, 0, 16, 30, inv), you_walk, new Sprite(33, 0, 15, 30, inv), you_walk]
        sprites["you"]["crouch"] = [new Sprite(51, 0, 16, 23, inv)]
        sprites["you"]["hurt"] = [new Sprite(70, 0, 16, 29, inv)]
        sprites["you"]["dead"] = [new Sprite(88, 0, 32, 15, inv)]
        sprites["you"]["attack"] = [new Sprite(0, 32, 32, 30, inv, -8, 0), new Sprite(33, 32, 32, 30, inv, -8, 0), new Sprite(66, 32, 44, 29, inv, 14, 0)]

        sprites["skeleton"] = new Map()
        sprites["skeleton"]["walk"] = [new Sprite(0, 0, 16, 31, inv)]

        let world = new World()
        Network.Request("resources/map.json", (data) => {
            world.load(gl, sprites, data)
            for (let i = 0; i < this.world.thing_count; i++) {
                if (this.world.things[i].sprite_id === "you") {
                    self.player = this.world.things[i]
                    break
                }
            }
        })

        window.onblur = function () {
            self.on = false
        }

        window.onfocus = function () {
            self.on = true
        }

        window.onresize = function () {
            self.resize()
        }

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove

        this.canvas = canvas
        this.screen = screen
        this.player = null
        this.sprite_buffers = sprite_buffers
        this.on = true
        this.gl = gl
        this.g = g
        this.generic = generic
        this.world = world

        this.resize()
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
        if (this.player === null) {
            setTimeout(run, 500)
            return
        }
        document.body.appendChild(this.canvas)
        this.loop()
    }
    loop() {
        if (this.on) {
            this.update()
            this.render()
        }
        requestAnimationFrame(loop)
    }
    update() {
        this.world.update()
    }
    render() {
        let g = this.g
        let gl = this.gl
        let frame = this.frame
        let player = this.player

        let view_x = -Math.floor(player.x - frame.width * 0.5)
        let view_y = -Math.floor(player.y - frame.height * 0.5)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        g.set_program(gl, "texture")
        g.set_orthographic(this.draw_ortho, view_x, view_y)
        g.update_mvp(gl)
        this.world.render(g, gl, frame, player.x, player.y, this.sprite_buffers)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, this.screen)
    }
}

let app = new Application()
app.run()

function run() {
    app.run()
}

function loop() {
    app.loop()
}