const MUSIC = {}
const SOUND = {}
const SPRITES = {}

class Application {
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

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 800, 1200)
        let generic2 = RenderBuffer.Init(gl, 2, 0, 2, 800, 1200)
        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let world = new World(gl)

        window.onblur = function () {
            self.on = false
            if (self.music)
                self.music.pause()
        }
        window.onfocus = function () {
            self.on = true
            if (self.music)
                self.music.play().then(() => {}).catch((_) => {})
        }

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove

        this.canvas = canvas
        this.screen = screen
        this.player = null
        this.on = true
        this.gl = gl
        this.g = g
        this.generic = generic
        this.generic2 = generic2
        this.world = world
        this.state = new MenuState(this)
    }
    async init() {
        let g = this.g
        let gl = this.gl

        let data = await Network.Request("resources/config/config.json")
        let config = JSON.parse(data)
        let shaders = config["shaders"]
        let textures = config["textures"]
        let music = config["music"]
        let sound = config["sound"]
        let sprites = config["sprites"]
        let tiles = config["tiles"]

        let promises = []

        for (let index = 0; index < shaders.length; index++)
            promises.push(g.make_program(gl, shaders[index]))

        for (let index = 0; index < textures.length; index++)
            promises.push(g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE))

        await Promise.all(promises)

        for (let index = 0; index < music.length; index++) {
            let iter = music[index]
            MUSIC[iter["name"]] = new Audio("resources/music/" + iter["path"])
            MUSIC[iter["name"]].loop = true
        }

        for (let index = 0; index < sound.length; index++)
            SOUND[sound[index]["name"]] = new Audio("resources/sound/" + sound[index]["path"])

        for (let index = 0; index < sprites.length; index++) {
            let sprite = sprites[index]
            let name = sprite["name"]
            let texture = g.textures[name]
            let width = 1.0 / texture.image.width
            let height = 1.0 / texture.image.height
            let animations = sprite["animations"]
            SPRITES[name] = {}
            for (let jindex = 0; jindex < animations.length; jindex++) {
                let animation = animations[jindex]
                let animation_name = animation["name"]
                let frames = animation["frames"]
                SPRITES[name][animation_name] = []
                for (let kindex = 0; kindex < frames.length; kindex++)
                    SPRITES[name][animation_name].push(new Sprite(frames[kindex], width, height))
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

        this.music = MUSIC["melody"]

        data = await Network.Send("api/store/load", "map")
        this.world.load(data)
        for (let index = 0; index < this.world.thing_count; index++) {
            if (this.world.things[index].uid === "you") {
                this.player = this.world.things[index]
                break
            }
        }

        let bx = Math.floor(this.player.x * INV_GRID_SIZE)
        let by = Math.floor(this.player.y * INV_GRID_SIZE)
        this.world.theme(bx, by)
    }
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

        let canvas_ortho = []
        let draw_ortho = []

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
    async run() {
        await this.init()
        let self = this
        window.onresize = function () {
            self.resize()
        }
        document.body.appendChild(this.canvas)
        this.resize()
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

function loop() {
    app.loop()
}