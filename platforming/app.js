const MUSIC = new Map()
const SOUND = new Map()
const SPRITES = new Map()

class Application {
    configure_opengl(gl) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
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

        Network.Request("resources/config.json", (data) => {
            let config = JSON.parse(data)
            let shaders = config["shaders"]
            let textures = config["textures"]
            let music = config["music"]
            let sound = config["sound"]
            let sprites = config["sprites"]
            let tiles = config["tiles"]

            for (let index = 0; index < shaders.length; index++)
                g.make_program(gl, shaders[index])

            for (let index = 0; index < textures.length; index++)
                g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE)

            for (let index = 0; index < music.length; index++) {
                let iter = music[index]
                MUSIC[iter["name"]] = new Audio("resources/" + iter["path"])
                MUSIC[iter["name"]].loop = true
            }

            for (let index = 0; index < sound.length; index++)
                SOUND[sound[index]["name"]] = new Audio("resources/" + sound[index]["path"])

            for (let index = 0; index < sprites.length; index++) {
                let sprite = sprites[index]
                let name = sprite["name"]
                let size = 1.0 / sprite["size"]
                let animations = sprite["animations"]
                SPRITES[name] = new Map()
                for (let jindex = 0; jindex < animations.length; jindex++) {
                    let animation = animations[jindex]
                    let animation_name = animation["name"]
                    let frames = animation["frames"]
                    SPRITES[name][animation_name] = []
                    for (let kindex = 0; kindex < frames.length; kindex++)
                        SPRITES[name][animation_name].push(new Sprite(frames[kindex], size))
                }
            }

            for (let index = 0; index < tiles.length; index++) {
                let tile = tiles[index]
                let texture = tile["texture"]
                let empty = tile["empty"]
                if (texture === null) TILE_TEXTURE.push(null)
                else TILE_TEXTURE.push(Sprite.Build(texture[0], texture[1], TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE))
                TILE_EMPTY.push(empty)
            }

            self.music = MUSIC["melody"]
        })

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 800, 1200)
        let generic2 = RenderBuffer.Init(gl, 2, 0, 2, 800, 1200)
        let sprite_buffers = new Map()
        sprite_buffers["you"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffers["skeleton"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffers["doodad"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffers["item"] = RenderBuffer.Init(gl, 2, 0, 2, 80, 120)

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let world = new World()
        Network.Request("resources/map.json", (data) => {
            world.load(gl, data)
            for (let i = 0; i < this.world.thing_count; i++) {
                if (this.world.things[i].sprite_id === "you") {
                    self.player = this.world.things[i]
                    break
                }
            }
        })

        window.onblur = function () {
            self.on = false
            if (self.music)
                self.music.pause()
        }
        window.onfocus = function () {
            self.on = true
            if (self.music)
                self.music.play()
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
        this.generic2 = generic2
        this.world = world
        this.state = new MenuState(this)

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
        if (this.music === null) {
            setTimeout(run, 500)
            return
        }
        document.body.appendChild(this.canvas)
        this.music.play()
        this.loop()
    }
    switch (state) {
        this.state = state
    }
    loop() {
        if (this.on) {
            this.state.update()
            this.state.render()
        }
        requestAnimationFrame(loop)
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