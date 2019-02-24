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

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)
        let generics = RenderBuffer.Init(gl, 2, 3, 0, 1600, 2400)
        let generics2 = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)

        this.on = true
        this.canvas = canvas
        this.gl = gl
        this.g = g
        this.screen = screen
        this.world = new World(g, gl)
        this.frame = null
        this.generics = generics
        this.generics2 = generics2
        this.camera = new Camera(16.0, 16.0, 48.0, 0.0, 0.0)
        this.state = new WorldState(this)

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove

        window.onblur = function () {
            self.on = false
        }

        window.onfocus = function () {
            self.on = true
        }
    }
    configure_opengl(gl) {
        gl.clearColor(0, 0, 0, 1)
        gl.depthFunc(gl.LEQUAL)
        gl.cullFace(gl.BACK)
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
        let draw_perspective = []

        let scale = 1.0
        let draw_width = canvas.width * scale
        let draw_height = canvas.height * scale

        Matrix.Orthographic(canvas_ortho, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)
        Matrix.Orthographic(draw_ortho, 0.0, draw_width, 0.0, draw_height, 0.0, 1.0)
        Matrix.Perspective(draw_perspective, 60.0, 0.01, 100.0, draw_width / draw_height)

        if (this.frame === null)
            this.frame = FrameBuffer.Make(gl, draw_width, draw_height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], "nearest", "depth")
        else
            FrameBuffer.Resize(gl, this.frame, draw_width, draw_height)

        screen.zero()
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

        this.canvas_ortho = canvas_ortho
        this.draw_ortho = draw_ortho
        this.draw_perspective = draw_perspective
    }
    async init() {
        let g = this.g
        let gl = this.gl

        let data = await Network.Request("json/resources.json")
        let config = JSON.parse(data)
        let shaders = config["shaders"]
        let textures = config["textures"]
        let sounds = config["sound"]
        let sprites = config["sprites"]
        let tiles = config["tiles"]

        let promises = []

        for (let index = 0; index < shaders.length; index++)
            promises.push(g.make_program(gl, shaders[index]))

        for (let index = 0; index < textures.length; index++)
            promises.push(g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE))

        await Promise.all(promises)

        for (let key in sounds)
            SOUND[key] = new Audio("sound/" + sounds[key])

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
            if (texture === null) TILE_TEXTURE.push(null)
            else TILE_TEXTURE.push(Sprite.Simple(texture[0], texture[1], TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE))
            TILE_CLOSED.push(tile["closed"])
        }

        data = await Network.Request("maps/map.json")
        this.world.load(data)
        for (let index = 0; index < this.world.thing_count; index++) {
            if (this.world.things[index].uid === "you") {
                this.player = this.world.things[index]
                break
            }
        }
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
