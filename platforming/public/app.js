const MUSIC = {}
const SOUND = {}
const SPRITE_DATA = {}
const SPRITE_ALIAS = {}
const SPRITE_ANIMATIONS = {}

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
        let colored = RenderBuffer.Init(gl, 2, 3, 2, 800, 1200)
        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let world = new World(g, gl)

        window.onblur = function () {
            self.on = false
            if (self.music)
                self.music.pause()
        }
        window.onfocus = function () {
            self.on = true
            if (self.music)
                self.music.play().then(() => { }).catch((_) => { })
        }

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove

        this.frame = null
        this.canvas = canvas
        this.screen = screen
        this.player = null
        this.on = true
        this.gl = gl
        this.g = g
        this.generic = generic
        this.generic2 = generic2
        this.colored = colored
        this.world = world
        this.state = new MenuState(this)
    }
    async init() {
        let g = this.g
        let gl = this.gl

        let data = await Network.Request("json/resources.json")
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

        for (let key in music) {
            let path = music[key]
            MUSIC[key] = new Audio("music/" + path)
            MUSIC[key].loop = true
        }

        for (let key in sound) {
            let path = sound[key]
            SOUND[key] = new Audio("sound/" + path)
        }

        for (let name in sprites) {
            let sprite = sprites[name]
            let animations = sprite["animations"]
            let alias = ("alias" in sprite) ? sprite["alias"] : null

            let sprite_json = await Network.Request("json/" + name + ".json")
            let sprite_data = JSON.parse(sprite_json)["sprites"]

            let texture = g.textures[name]
            let width = 1.0 / texture.image.width
            let height = 1.0 / texture.image.height

            SPRITE_DATA[name] = {}
            SPRITE_ALIAS[name] = {}
            SPRITE_ANIMATIONS[name] = {}

            for (let key in animations)
                SPRITE_ANIMATIONS[name][key] = animations[key]

            if (alias != null)
                for (let key in alias)
                    SPRITE_ALIAS[name][key] = alias[key]

            for (let key in sprite_data) {
                let sprite = sprite_data[key]
                let atlas = sprite.atlas
                let boxes = sprite.boxes

                SPRITE_DATA[name][key] = Sprite.Build(atlas, boxes, width, height)
            }
        }

        for (let key in tiles) {
            let tile = tiles[key]
            let texture = tile["texture"]
            let empty = tile["empty"]
            if (texture === null) TILE_TEXTURE.push(null)
            else
                TILE_TEXTURE.push(Sprite.Simple(texture[0], texture[1], TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE))
            TILE_EMPTY.push(empty)
        }

        this.music = MUSIC["melody"]

        data = await Network.Request("maps/map.json")
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
        gl.depthFunc(gl.LEQUAL)
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

        if (this.frame === null)
            this.frame = FrameBuffer.Make(gl, draw_width, draw_height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], "nearest", "depth")
        else
            FrameBuffer.Resize(gl, this.frame, draw_width, draw_height)

        screen.zero()
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

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
    switch(state) {
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