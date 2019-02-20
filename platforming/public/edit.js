const SPRITE_DATA = {}
const SPRITE_ANIMATIONS = {}

class Application {
    constructor() {
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

        document.body.style.cursor = "url(\"textures/cursor.png\"), default"

        let gl = canvas.getContext("webgl2")
        let g = new RenderSystem()

        this.configure_opengl(gl)

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 6400, 9600)
        let colors = RenderBuffer.Init(gl, 2, 3, 0, 6400, 9600)
        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let sprite_buffer = {}
        sprite_buffer["buttons"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffer["map"] = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)
        sprite_buffer["font"] = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)

        let world = new World(g, gl)

        let form_list = [
            new EditMain("main", "0", "top", "200", "min", 127, 255, 127),
            new EditFolder("folder", "0", "0", "same$main", "to$main", 127, 127, 255),
            new EditWorld("world", "same$main", "top", "fill", "min", 255, 127, 127),
        ]

        let forms = new Map()
        for (let i in form_list) {
            let form = form_list[i]
            forms.set(form.uid, form)
        }

        this.cli_input = ""
        this.mouse_x = null
        this.mouse_y = null
        this.mouse_previous_x = null
        this.mouse_previous_y = null
        this.mouse = false
        this.action = null
        this.frame = null
        this.canvas = canvas
        this.screen = screen
        this.gl = gl
        this.g = g
        this.generic = generic
        this.colors = colors
        this.sprite_buffer = sprite_buffer
        this.world = world
        this.forms = forms
        this.active_form = form_list[0]
        this.camera = {
            x: 0.5 * GRID_SIZE,
            y: 0
        }
    }
    async init() {
        let g = this.g
        let gl = this.gl
        let sprite_buffer = this.sprite_buffer
        let requests = []

        requests.push(async function () {
            let data = await Network.Request("json/resources.json")
            let config = JSON.parse(data)
            let shaders = config["shaders"]
            let textures = config["textures"]
            let sprites = config["sprites"]
            let tiles = config["tiles"]

            let promises = []

            for (let index = 0; index < shaders.length; index++)
                promises.push(g.make_program(gl, shaders[index]))

            for (let index = 0; index < textures.length; index++)
                promises.push(g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE))

            await Promise.all(promises)

            for (let name in sprites) {
                let sprite = sprites[name]
                let animations = sprite["animations"]
                let offsets = ("offsets" in sprite) ? sprite["offsets"] : null

                let sprite_json = await Network.Request("json/" + name + ".json")
                let sprite_data = JSON.parse(sprite_json)["sprites"]

                let texture = g.textures[name]
                let width = 1.0 / texture.image.width
                let height = 1.0 / texture.image.height

                sprite_buffer[name] = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)

                SPRITE_DATA[name] = {}
                SPRITE_ANIMATIONS[name] = {}

                for (let key in animations)
                    SPRITE_ANIMATIONS[name][key] = animations[key]

                for (let key in sprite_data) {
                    let sprite = sprite_data[key]
                    let atlas = sprite.atlas
                    let boxes = sprite.boxes

                    if (offsets !== null && key in offsets) {
                        let offset = offsets[key]
                        atlas.push(offset[0])
                        atlas.push(offset[1])
                    }

                    SPRITE_DATA[name][key] = Sprite.Build(atlas, boxes, width, height)
                }
            }

            SPRITE_DATA["map"] = {}
            for (let key in tiles) {
                let tile = tiles[key]
                let texture = tile["texture"]
                let empty = tile["empty"]
                if (texture === null) TILE_TEXTURE.push(null)
                else {
                    TILE_TEXTURE.push(Sprite.Simple(texture[0], texture[1], TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE))
                    SPRITE_DATA["map"][key] = Sprite.Build([texture[0], texture[1], TILE_SIZE, TILE_SIZE], null, TILE_SPRITE_SIZE, TILE_SPRITE_SIZE)
                }
                TILE_EMPTY.push(empty)
            }
        }())

        requests.push(async function () {
            let data = await Network.Request("json/resources-edit.json")
            let config = JSON.parse(data)
            let shaders = config["shaders"]
            let textures = config["textures"]
            let sprites = config["sprites"]

            let promises = []

            for (let index = 0; index < shaders.length; index++)
                promises.push(g.make_program(gl, shaders[index]))

            for (let index = 0; index < textures.length; index++)
                promises.push(g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE))

            await Promise.all(promises)

            for (let index = 0; index < sprites.length; index++) {
                let sprite = sprites[index]
                let name = sprite["name"]
                let texture = g.textures[name]
                let width = 1.0 / texture.image.width
                let height = 1.0 / texture.image.height
                let animations = sprite["animations"]

                SPRITE_DATA[name] = {}

                for (let jindex = 0; jindex < animations.length; jindex++) {
                    let animation = animations[jindex]
                    let animation_name = animation["name"]
                    let frames = animation["frames"]
                    SPRITE_DATA[name][animation_name] = Sprite.Build(frames[0], null, width, height)
                }
            }
        }())

        await Promise.all(requests)

        let data = await Network.Request("maps/template.json")
        this.world.load(data)
        this.camera.y = 0.5 * this.world.height * GRID_SIZE
    }
    configure_opengl(gl) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.SCISSOR_TEST)
    }
    resize() {
        let gl = this.gl
        let canvas = this.canvas
        let screen = this.screen

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let canvas_ortho = []
        let draw_ortho = []

        let scale = 1.0
        let draw_width = canvas.width * scale
        let draw_height = canvas.height * scale

        Matrix.Orthographic(draw_ortho, 0.0, draw_width, 0.0, draw_height, 0.0, 1.0)
        Matrix.Orthographic(canvas_ortho, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)

        if (this.frame === null)
            this.frame = FrameBuffer.Make(gl, draw_width, draw_height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], "nearest", "no.depth")
        else
            FrameBuffer.Resize(gl, this.frame, draw_width, draw_height)

        screen.zero()
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

        this.canvas_ortho = canvas_ortho
        this.draw_ortho = draw_ortho

        for (let form of this.forms.values())
            form.resize(this.forms, this.frame)
    }
    key_down(event) {
        if (event.key === "Backspace") {
            this.cli_input = this.cli_input.substring(0, this.cli_input.length - 1)
            event.preventDefault()
            this.render()
        } else {
            let key = String.fromCharCode(event.keyCode);
            if (/[a-zA-Z0-9-_ ]/.test(key)) {
                this.cli_input += event.key
                this.render()
            }
        }
    }
    mouse_up(event) {
        if (event.button !== 0)
            return
        this.mouse = false
    }
    mouse_down(event) {
        if (event.button !== 0)
            return
        this.mouse = true
        let nop = true

        for (let form of this.forms.values()) {
            if (form.inside(this.mouse_x, this.mouse_y)) {
                if (form.on(this, this.mouse_x, this.mouse_y))
                    this.active_form = form
                nop = false
                break
            }
        }

        if (nop)
            this.active_form.nop(this, this.mouse_x, this.mouse_y)
    }
    mouse_move(event) {
        this.mouse_previous_x = this.mouse_x
        this.mouse_previous_y = this.mouse_y
        this.mouse_x = event.clientX
        this.mouse_y = this.canvas.height - event.clientY
        if (this.mouse) {
            let nop = true
            for (let form of this.forms.values()) {
                if (form.inside(this.mouse_x, this.mouse_y)) {
                    nop = false
                    break
                }
            }
            if (nop)
                this.active_form.drag(this, this.mouse_x, this.mouse_y)
        }
    }
    mouse_to_world_x() {
        return this.mouse_x + this.camera.x - this.canvas.width * 0.5
    }
    mouse_to_world_y() {
        return this.mouse_y + this.camera.y - this.canvas.height * 0.5
    }
    async run() {
        await this.init()
        let self = this
        document.onkeydown = key_down
        document.onmouseup = mouse_up
        document.onmousedown = mouse_down
        document.onmousemove = mouse_move
        document.oncontextmenu = function () {
            return false
        }
        window.onresize = function () {
            self.resize()
            self.render()
        }
        document.body.appendChild(this.canvas)
        this.resize()
        this.render()
    }
    render() {
        let g = this.g
        let gl = this.gl
        let frame = this.frame
        let camera = this.camera
        let sprite_buffer = this.sprite_buffer

        let view_x = -Math.floor(camera.x - frame.width * 0.5)
        let view_y = -Math.floor(camera.y - frame.height * 0.5)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)

        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        g.set_program(gl, "color")
        g.set_orthographic(this.draw_ortho, view_x, view_y)
        g.update_mvp(gl)
        this.world_background(frame, camera.x, camera.y)
        g.set_program(gl, "texture")
        g.update_mvp(gl)
        this.world.render(g, frame, camera.x, camera.y, this.generic)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, this.screen)

        g.set_program(gl, "texture")
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl)

        for (let key in sprite_buffer)
            sprite_buffer[key].zero()

        for (let form of this.forms.values())
            form.draw(gl, sprite_buffer)

        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        for (let key in sprite_buffer) {
            let buffer = sprite_buffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(this.gl, key)
                RenderSystem.UpdateAndDraw(this.gl, buffer)
            }
        }
    }
    world_background(frame, x, y) {
        let colors = this.colors
        let world = this.world

        colors.zero()

        let hw = frame.width * 0.5
        let hh = frame.height * 0.5

        let c_min = Math.floor((x - hw) * INV_GRID_SIZE)
        let c_lim = Math.floor((x + hw) * INV_GRID_SIZE)
        let r_min = Math.floor((y - hh) * INV_GRID_SIZE)
        let r_lim = Math.floor((y + hh) * INV_GRID_SIZE)

        if (c_min < 0) c_min = 0
        if (r_min < 0) r_min = 0
        if (c_lim >= world.width) c_lim = world.width - 1
        if (r_lim >= world.height) r_lim = world.height - 1

        for (let gy = r_min; gy <= r_lim; gy++) {
            for (let gx = c_min; gx <= c_lim; gx++) {
                let block = world.blocks[gx + gy * world.width]
                Render.Color(colors, gx * GRID_SIZE, gy * GRID_SIZE, GRID_SIZE, GRID_SIZE, block.red / 255.0, block.green / 255.0, block.blue / 255.0)
            }
        }

        RenderSystem.UpdateAndDraw(this.gl, colors)
    }
}

let app = new Application()
app.run()

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