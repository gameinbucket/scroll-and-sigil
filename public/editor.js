class EditorApp {
    constructor(manager) {
        this.manager = manager

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

        gl.clearColor(0, 0, 0, 1)
        gl.depthFunc(gl.LEQUAL)
        gl.cullFace(gl.BACK)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)

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
        this.camera = null
        this.state = new WorldState(this)

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove
    }
    resize() {
        let gl = this.gl
        let canvas = this.canvas
        let screen = this.screen

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let canvasOrtho = []
        let drawOrtho = []
        let drawPerspective = []

        let scale = 1.0
        let drawWidth = canvas.width * scale
        let drawHeight = canvas.height * scale
        let ratio = drawWidth / drawHeight
        let fov = 2 * Math.atan(Math.tan(60 * (Math.PI / 180) / 2) / ratio) * (180 / Math.PI)

        Matrix.Orthographic(canvasOrtho, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)
        Matrix.Orthographic(drawOrtho, 0.0, drawWidth, 0.0, drawHeight, 0.0, 1.0)
        Matrix.Perspective(drawPerspective, fov, 0.01, 100.0, ratio)

        if (this.frame === null) {
            this.frame = FrameBuffer.Make(gl, drawWidth, drawHeight, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], "nearest", "depth")
        } else {
            this.frame.Resize(gl, drawWidth, drawHeight)
        }

        screen.Zero()
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

        this.canvasOrtho = canvasOrtho
        this.drawOrtho = drawOrtho
        this.drawPerspective = drawPerspective
    }
    async init() {
        let g = this.g
        let gl = this.gl

        let data = await Network.Request("wad")
        await Wad.Load(g, gl, data)

        let raw = await Network.Request("test.map")

        this.world.Load(raw)
        this.manager.init(this)
    }
    async run() {
        await this.init()
        let self = this
        window.onresize = function () {
            self.resize()
        }
        document.body.appendChild(this.canvas)
        this.resize()
        this.state.render()
    }
}

function PlaySound(name) {
    let sound = Sounds[name]
    sound.pause()
    sound.volume = 0.25
    sound.currentTime = 0
    let promise = sound.play()
    if (promise) promise.then(_ => {}).catch(_ => {})
}

class Editor {
    constructor() {}
    async init() {
        this.camera = new SimpleCamera()
    }
}

let editor = new Editor()
let app = new EditorApp(editor)

app.run()
