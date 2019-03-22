let SOCKET = null
let SOCKET_QUEUE = []
let SOCKET_SEND = []

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
        this.camera = null
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
        let ratio = draw_width / draw_height
        let fov = 2 * Math.atan(Math.tan(60 * (Math.PI / 180) / 2) / ratio) * (180 / Math.PI)

        Matrix.Orthographic(canvas_ortho, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)
        Matrix.Orthographic(draw_ortho, 0.0, draw_width, 0.0, draw_height, 0.0, 1.0)
        Matrix.Perspective(draw_perspective, fov, 0.01, 100.0, ratio)

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

        let data = await Network.Request("wad")
        await Wad.Load(g, gl, data)

        let socket = await Network.Socket("ws://localhost:3000/websocket")
        socket.onclose = function () {
            socket = null
        }
        this.socket = socket
        SOCKET = socket

        data = await new Promise(function (resolve) {
            socket.onmessage = function (event) {
                resolve(event.data)
            }
        })

        socket.onmessage = function (event) {
            SOCKET_QUEUE.push(event.data)
        }

        this.world.load(data)
        for (let index = 0; index < this.world.thingCount; index++) {
            if (this.world.things[index].UID === "you") {
                this.player = this.world.things[index]
                this.camera = new Camera(this.player, 10.0, 0.0, 0.0)
                this.player.camera = this.camera
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
