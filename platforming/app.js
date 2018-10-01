class Application {
    configure_opengl(gl) {
        gl.clearColor(0, 0, 0, 1)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
    }
    load_programs(g, gl) {
        g.make_program(gl, 'texture')
    }
    load_images(g, gl) {
        g.make_image(gl, 'caverns', gl.CLAMP_TO_EDGE)
        g.make_image(gl, 'footman', gl.CLAMP_TO_EDGE)
    }
    constructor() {

        let self = this

        let canvas = document.createElement('canvas')
        canvas.style.display = 'block'
        canvas.style.position = 'absolute'
        canvas.style.left = '0'
        canvas.style.right = '0'
        canvas.style.top = '0'
        canvas.style.bottom = '0'
        canvas.style.margin = 'auto'
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let gl = canvas.getContext("webgl2")
        let g = new RenderSystem()

        this.configure_opengl(gl)
        this.load_programs(g, gl)
        this.load_images(g, gl)

        Matrix.Orthographic(g.orthographic, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 1600, 2400)
        let sprite_buffers = new Map()
        sprite_buffers['footman'] = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)


        let frame = new FrameBuffer(gl, canvas.width, canvas.height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], false, true)

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

        let s = 16.0
        let w = 1.0 / 256.0
        let h = 1.0 / 128.0
        let sprite_cavern = {}
        sprite_cavern['dirt'] = new Sprite(1 + 17 * 0, 1 + 17 * 0, s, s, w, h, 0, 0)
        sprite_cavern['dirt light'] = new Sprite(1 + 17 * 0, 1 + 17 * 1, s, s, w, h, 0, 0)
        sprite_cavern['dirt lightest'] = new Sprite(1 + 17 * 0, 1 + 17 * 2, s, s, w, h, 0, 0)
        sprite_cavern['wall'] = new Sprite(1 + 17 * 1, 1 + 17 * 0, s, s, w, h, 0, 0)
        sprite_cavern['wall edge'] = new Sprite(1 + 17 * 1, 1 + 17 * 1, s, s, w, h, 0, 0)
        sprite_cavern['wall corner'] = new Sprite(1 + 17 * 1, 1 + 17 * 2, s, s, w, h, 0, 0)
        sprite_cavern['stone floor'] = new Sprite(1 + 17 * 1, 1 + 17 * 3, s, s, w, h, 0, 0)

        let world = new World(8, 3)
        world.build(gl)

        w = 1.0 / 1024.0
        h = 1.0 / 256.0
        let d = 48.0
        let z = 0.0
        let t = 24.0
        let footman_walk = []
        footman_walk[0] = new Array(8)
        footman_walk[1] = new Array(8)
        footman_walk[2] = new Array(8)
        footman_walk[3] = new Array(8)
        footman_walk[4] = new Array(8)
        for (let i = 0; i < 5; i++) {
            footman_walk[i][0] = new Sprite(i * d, 0, d, d, w, h, z, t)
            footman_walk[i][1] = new Sprite(i * d, 4.0 * d, d, d, w, h, z, t)
            footman_walk[i][2] = new Sprite(i * d, 3.0 * d, d, d, w, h, z, t)
            footman_walk[i][3] = footman_walk[i][1]
            footman_walk[i][4] = footman_walk[i][0]
            footman_walk[i][5] = new Sprite(i * d, 0.0 * d, d, d, w, h, z, t)
            footman_walk[i][6] = new Sprite(i * d, 1.0 * d, d, d, w, h, z, t)
            footman_walk[i][7] = footman_walk[i][5]
        }

        new Thing(world, 0, footman_walk, 16, 9, 20)

        window.onblur = function () {
            self.on = false
        }

        window.onfocus = function () {
            self.on = false
        }

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove

        let func_nothing = function (app) {}
        let button_nothing = new Button(this, sprite_cavern['dirt'], func_nothing, 10, 10, 32, 32)

        let func_add_block = function (app) {}
        let button_add_block = new Button(this, sprite_cavern['wall'], func_add_block, 52, 10, 32, 32)

        let func_add_thing = function (app) {}
        let button_add_thing = new Button(this, sprite_cavern['stone floor'], func_add_thing, 94, 10, 32, 32)

        let buttons = [button_nothing, button_add_block, button_add_thing]

        this.sprite_buffers = sprite_buffers
        this.on = true
        this.canvas = canvas
        this.gl = gl
        this.g = g
        this.frame = frame
        this.generic = generic
        this.screen = screen
        this.world = world
        this.sprite_cavern = sprite_cavern
        this.buttons = buttons
        this.footman_walk = footman_walk
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
        if (Input.IsClick(0)) {
            Input.Clicked(0)
            INPUT_POS[1] = this.canvas.height - INPUT_POS[1]
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].click(INPUT_POS)) {
                    break
                }
            }
        }
        this.world.update()
    }
    render() {
        let g = this.g
        let gl = this.gl
        let frame = this.frame

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        g.set_program(gl, 'texture')
        g.set_orthographic(0, 0)
        g.update_mvp(gl)

        this.world.render(g, gl, this.sprite_buffers)

        this.generic.zero()
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw(this.generic)
        }
        g.set_texture(gl, 'caverns')
        RenderSystem.UpdateAndDraw(gl, this.generic)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height)
        g.set_program(gl, 'texture')
        g.set_orthographic(0, 0)
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