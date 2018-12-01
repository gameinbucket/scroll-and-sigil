const SPRITES = {}

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

        let gl = canvas.getContext("webgl2")
        let g = new RenderSystem()

        this.configure_opengl(gl)

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 6400, 9600)
        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let sprite_buffer = {}
        sprite_buffer["buttons"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffer["you"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffer["skeleton"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffer["map"] = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)

        let world = new World(gl)

        document.onkeydown = key_down
        document.onmouseup = mouse_up
        document.onmousedown = mouse_down
        document.onmousemove = mouse_move
        document.oncontextmenu = function () {
            return false
        }

        this.cli_input = ""
        this.mouse_x = null
        this.mouse_y = null
        this.mouse_previous_x = null
        this.mouse_previous_y = null
        this.mouse = false
        this.action = null
        this.canvas = canvas
        this.screen = screen
        this.gl = gl
        this.g = g
        this.generic = generic
        this.sprite_buffer = sprite_buffer
        this.world = world
        this.buttons = {}
        this.active_buttons = []
        this.tile_select = TILE_NONE
        this.thing_select = null
        this.camera = {
            x: 0.5 * GRID_SIZE,
            y: 0
        }
    }
    async init() {
        let g = this.g
        let gl = this.gl
        let requests = []

        requests.push(async function () {
            let data = await Network.Request("resources/config.json")
            let config = JSON.parse(data)
            let shaders = config["shaders"]
            let textures = config["textures"]
            let sprites = config["sprites"]
            let tiles = config["tiles"]

            let promises = new Array(shaders.length + textures.length)

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

            SPRITES["map"] = {}
            for (let index = 0; index < tiles.length; index++) {
                let tile = tiles[index]
                let texture = tile["texture"]
                let empty = tile["empty"]
                if (texture === null) TILE_TEXTURE.push(null)
                else {
                    TILE_TEXTURE.push(Sprite.Build(texture[0], texture[1], TILE_SIZE, TILE_SIZE, TILE_SPRITE_SIZE))
                    SPRITES["map"][tile["name"]] = [new Sprite([texture[0], texture[1], TILE_SIZE, TILE_SIZE], TILE_SPRITE_SIZE, TILE_SPRITE_SIZE)]
                }
                TILE_EMPTY.push(empty)
            }
        }())

        requests.push(async function () {
            let data = await Network.Request("resources/config-edit.json")
            let config = JSON.parse(data)
            let textures = config["textures"]
            let sprites = config["sprites"]

            let promises = new Array(textures.length)

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
        }())

        await Promise.all(requests)

        Editing.InitButtons(this)

        let data = await Network.Send("api/store/load", "template")
        this.world.load(data)
        this.camera.y = 0.5 * this.world.height * GRID_SIZE
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

        let pad = 10

        let left_buttons = this.buttons["left"]
        let x = pad
        let y = this.canvas.height - pad - left_buttons[0].height
        for (let index = 0; index < left_buttons.length; index++) {
            let button = left_buttons[index]
            button.put(x, y)
            x += pad + button.width
        }

        let right_buttons = this.buttons["right"]
        right_buttons[0].put(this.canvas.width - pad - right_buttons[0].width, this.canvas.height - pad - right_buttons[0].height)
    }
    key_down(event) {
        if (event.key === "Backspace") {
            this.cli_input = this.cli_input.substring(0, this.cli_input.length - 1)
            event.preventDefault()
            this.render()
        } else if (event.key === "Enter") {
            if (this.cli_input.startsWith("save")) {
                this.edit_save()
            }
            if (this.cli_input.startsWith("add tile")) {
                let tile = this.cli_input.substring("add tile".length).trim()
                if (tile.startsWith("wall")) {
                    this.tile_select = TILE_WALL
                    this.action = "place.tile"
                } else if (tile.startsWith("stairs right")) {
                    this.tile_select = TILE_STAIRS_RIGHT
                    this.action = "place.tile"
                }
            }
            this.cli_input = ""
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

        for (let key in this.buttons) {
            let group = this.buttons[key]
            for (let index = 0; index < group.length; index++) {
                let button = group[index]
                if (button.click(this.mouse_x, this.mouse_y)) {
                    button.activate(button)
                    nop = false
                }
            }
        }

        if (nop) {
            for (let i in this.active_buttons) {
                let button = this.active_buttons[i]
                if (button.on !== null)
                    button.on(button)
            }
        }
    }
    mouse_move(event) {
        this.mouse_previous_x = this.mouse_x
        this.mouse_previous_y = this.mouse_y
        this.mouse_x = event.clientX
        this.mouse_y = this.canvas.height - event.clientY
        if (this.mouse) {
            for (let i in this.active_buttons) {
                let button = this.active_buttons[i]
                if (button.drag !== null)
                    button.drag(button)
            }
        }
    }
    edit_save() {
        if (this.cli_input !== "") {
            let data = this.world.save(this.cli_input)
            this.cli_input = ""
            Network.Send("api/store/save", data)
        }
    }
    edit_action_on() {
        switch (this.action) {
            case "place.tile":
                this.edit_set_tile(this.tile_select)
                break
            case "eraser":
                this.edit_set_tile(TILE_NONE)
                break
            case "add.ground":
                this.edit_set_tile(TILE_GROUND)
                break
            case "add.wall":
                this.edit_set_tile(TILE_WALL)
                break
            case "add.rail":
                this.edit_set_tile(TILE_RAIL)
                break
            case "add.you":
                this.edit_add_thing("you")
                break
            case "add.skeleton":
                this.edit_add_thing("skeleton")
                break
        }
    }
    edit_action_move() {
        switch (this.action) {
            case "eraser":
                this.edit_set_tile(TILE_NONE)
                // TODO: remove SPRITES
                break
            case "add.ground":
                this.edit_set_tile(TILE_GROUND)
                break
            case "add.wall":
                this.edit_set_tile(TILE_WALL)
                break
            case "add.rail":
                this.edit_set_tile(TILE_RAIL)
                break
            case "move.cam":
                break
        }
    }
    mouse_to_world_x() {
        return this.mouse_x + this.camera.x - this.canvas.width * 0.5
    }
    mouse_to_world_y() {
        return this.mouse_y + this.camera.y - this.canvas.height * 0.5
    }
    edit_add_thing(id) {
        let px = this.mouse_to_world_x()
        if (px < 0 || px >= this.world.width * GRID_SIZE) return
        let py = this.mouse_to_world_y()
        if (py < 0 || py >= this.world.height * GRID_SIZE) return

        let bx = Math.floor(px * INV_GRID_SIZE)
        let by = Math.floor(py * INV_GRID_SIZE)
        let tx = Math.floor(px * INV_TILE_SIZE) % BLOCK_SIZE
        let ty = Math.floor(py * INV_TILE_SIZE) % BLOCK_SIZE

        // TODO: head of thing out of bounds

        let block = this.world.blocks[bx + by * this.world.width]
        let tile = block.tiles[tx + ty * BLOCK_SIZE]

        while (TILE_EMPTY[tile]) {
            ty -= 1
            if (ty < 0) {
                ty += BLOCK_SIZE
                by -= 1
                if (by === -1)
                    return
                block = this.world.blocks[bx + by * this.world.width]
            }
            tile = block.tiles[tx + ty * BLOCK_SIZE]
        }

        py = (ty + 1 + by * BLOCK_SIZE) * TILE_SIZE

        if (id === "skeleton")
            new Skeleton(this.world, px, py)
        else if (id === "you")
            new You(this.world, px, py)

        this.render()
    }
    edit_set_tile(tile) {
        let px = this.mouse_to_world_x()
        if (px < 0 || px >= this.world.width * GRID_SIZE) return
        let py = this.mouse_to_world_y()
        if (py < 0 || py >= this.world.height * GRID_SIZE) return

        let bx = Math.floor(px * INV_GRID_SIZE)
        let by = Math.floor(py * INV_GRID_SIZE)
        let tx = Math.floor(px * INV_TILE_SIZE) % BLOCK_SIZE
        let ty = Math.floor(py * INV_TILE_SIZE) % BLOCK_SIZE

        let block = this.world.blocks[bx + by * this.world.width]
        let index = tx + ty * BLOCK_SIZE
        let existing = block.tiles[index]

        if (tile !== existing) {
            block.tiles[index] = tile
            block.build_mesh(this.gl)
            this.render()
        }
    }
    async run() {
        await this.init()
        let self = this
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
        let generic = this.generic
        let sprite_buffer = this.sprite_buffer

        let view_x = -Math.floor(camera.x - frame.width * 0.5)
        let view_y = -Math.floor(camera.y - frame.height * 0.5)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)

        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        g.set_program(gl, "texture")
        g.set_orthographic(this.draw_ortho, view_x, view_y)
        g.update_mvp(gl)
        this.world.render(g, frame, camera.x, camera.y)

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

        generic.zero()
        for (let key in sprite_buffer)
            sprite_buffer[key].zero()

        for (let key in this.buttons) {
            let group = this.buttons[key]
            for (let index = 0; index < group.length; index++)
                group[index].draw(generic, sprite_buffer)
        }

        g.set_texture(gl, "buttons")
        RenderSystem.UpdateAndDraw(gl, generic)

        for (let key in sprite_buffer) {
            let buffer = sprite_buffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(this.gl, key)
                RenderSystem.UpdateAndDraw(this.gl, buffer)
            }
        }

        // if (this.action === "select.tile") {
        //     generic.zero()
        //     generic2.zero()
        //     for (let i = 1; i < TILE_TEXTURE.length; i++) {
        //         Render.Sprite(generic, 40 + (TILE_SIZE + 5) * i, frame.height - 100, SPRITES["buttons"]["ground"][0])
        //         let texture = TILE_TEXTURE[i]
        //         Render.Image(generic2, 40 + (TILE_SIZE + 5) * i, frame.height - 100, TILE_SIZE, TILE_SIZE, texture[0], texture[1], texture[2], texture[3])
        //     }

        //     g.set_texture(gl, "buttons")
        //     RenderSystem.UpdateAndDraw(gl, generic)
        //     g.set_texture(gl, "map")
        //     RenderSystem.UpdateAndDraw(gl, generic2)
        // }

        generic.zero()
        Render.Print(generic, this.cli_input, 10, 10, 2)
        g.set_texture(gl, "font")
        RenderSystem.UpdateAndDraw(gl, generic)
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