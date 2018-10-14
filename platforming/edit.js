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
        g.make_image(gl, "buttons", gl.CLAMP_TO_EDGE)
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

        let generic = RenderBuffer.Init(gl, 2, 0, 2, 6400, 9600)
        let sprite_buffers = new Map()
        sprite_buffers["you"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)
        sprite_buffers["skeleton"] = RenderBuffer.Init(gl, 2, 0, 2, 40, 60)

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)

        let sprites = new Map()
        let inv = 1.0 / 128.0

        sprites["map"] = new Map()
        sprites["map"]["dirt"] = new Sprite(0, 0, TILE_SIZE, TILE_SIZE, inv)

        sprites["buttons"] = new Map()
        sprites["buttons"]["reg"] = new Sprite(1, 1, 48, 48, inv, inv)

        sprites["you"] = new Map()
        sprites["you"]["walk"] = [new Sprite(0, 0, 16, 30, inv)]

        sprites["skeleton"] = new Map()
        sprites["skeleton"]["walk"] = [new Sprite(0, 0, 16, 31, inv)]

        let world = new World(8, 3)
        world.build(gl)

        window.onresize = function () {
            self.resize()
            self.render()
        }

        document.onkeyup = key_up
        document.onkeydown = key_down
        document.onmouseup = mouse_up
        document.onmousedown = mouse_down
        document.onmousemove = mouse_move

        let btn = 32
        let pad = 10
        let buttons = [
            new Button(this, sprites["buttons"]["reg"], "menu", pad, pad, btn, btn),
            new Button(this, sprites["buttons"]["reg"], "load", pad, pad + 1 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["reg"], "save", pad, pad + 2 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["reg"], "add.ground", pad, pad + 3 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["reg"], "add.wall", pad, pad + 4 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["reg"], "add.rail", pad, pad + 5 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["reg"], "add.skeleton", pad, pad + 6 * (btn + pad), btn, btn),
            new Button(this, sprites["buttons"]["reg"], "eraser", pad, pad + 7 * (btn + pad), btn, btn)
        ]

        this.on = true
        this.mouse_x = null
        this.mouse_y = null
        this.mouse_left = false
        this.action = null
        this.canvas = canvas
        this.screen = screen
        this.sprites = sprites
        this.sprite_buffers = sprite_buffers
        this.gl = gl
        this.g = g
        this.generic = generic
        this.world = world
        this.buttons = buttons
        this.edit_tile_uid = null
        this.c_edit_tile = null
        this.c_min_edit_tile = null
        this.c_max_edit_tile = null
        this.r_edit_tile = null
        this.r_min_edit_tile = null
        this.r_max_edit_tile = null
        this.camera = {
            x: 200,
            y: 200
        }

        this.resize()
    }
    key_up(event) {}
    key_down(event) {}
    mouse_up(event) {
        if (event.button !== 0)
            return
        this.mouse_left = false
        let action = null;
        let buttons = this.buttons

        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i]
            if (button.click(this.mouse_x, this.mouse_y)) {
                action = button.action
                break
            }
        }

        if (action === null) this.edit_action_off()
        else this.edit_next_action(action)
    }
    mouse_down(event) {
        if (event.button !== 0)
            return
        this.mouse_left = true
        if (this.mouse_x > 10 + 10 + 32)
            this.edit_action_on()
    }
    edit_next_action(action) {
        switch (action) {
            case "save":
                let saving = this.world.save()
                console.log(saving)
                localStorage.setItem("world", saving)
                break
            case "load":
                let loading = localStorage.getItem("world")
                if (loading === null) break
                this.world.load(this.gl, loading)
                this.render()
                break
            case "menu":
                break
            default:
                this.action = action
        }
    }
    edit_action_on() {
        switch (this.action) {
            case "eraser":
                this.edit_begin_tile(TILE_NONE)
            case "add.ground":
                this.edit_begin_tile(TILE_GROUND)
                break
            case "add.wall":
                this.edit_begin_tile(TILE_WALL)
                break
            case "add.rail":
                this.edit_begin_tile(TILE_RAIL)
                break
            case "add.skeleton":
                let px = this.mouse_to_world_x()
                if (px < 0 || px >= this.world.block_w * GRID_SIZE) return
                let py = this.mouse_to_world_y()
                if (py < 0 || py >= this.world.block_h * GRID_SIZE) return
                new Thing(this.world, "skeleton", this.sprites["skeleton"], px, py)
                this.render()
                break
        }
    }
    edit_action_move() {
        switch (this.action) {
            case "eraser":
            case "add.ground":
            case "add.wall":
            case "add.rail":
                this.edit_update_mouse_tile()
                break
        }
    }
    edit_action_off() {
        switch (this.action) {
            case "eraser":
            case "add.ground":
            case "add.wall":
            case "add.rail":
                // this.edit_set_tile(TILE_GROUND)
                if (this.c_min_edit_tile < 0) this.c_min_edit_tile = 0
                if (this.r_min_edit_tile < 0) this.r_min_edit_tile = 0
                if (this.c_max_edit_tile >= this.world.block_w * BLOCK_SIZE) this.c_max_edit_tile = this.world.block_w * BLOCK_SIZE - 1
                if (this.r_max_edit_tile >= this.world.block_h * BLOCK_SIZE) this.r_max_edit_tile = this.world.block_h * BLOCK_SIZE - 1
                let block_set = new Set()
                for (let gy = this.r_min_edit_tile; gy <= this.r_max_edit_tile; gy++) {
                    let by = Math.floor(gy * INV_BLOCK_SIZE)
                    let ty = gy % BLOCK_SIZE
                    for (let gx = this.c_min_edit_tile; gx <= this.c_max_edit_tile; gx++) {
                        let bx = Math.floor(gx * INV_BLOCK_SIZE)
                        let tx = gx % BLOCK_SIZE
                        let block = this.world.blocks[bx + by * this.world.block_w]
                        block.tiles[tx + ty * BLOCK_SIZE] = this.edit_tile_uid
                        block_set.add(block)
                    }
                }
                for (let block of block_set) {
                    block.build_mesh(this.gl)
                }
                this.render()
                this.edit_tile_uid = null
                break
        }
    }
    mouse_to_world_x() {
        return this.mouse_x + this.camera.x - this.canvas.width * 0.5
    }
    mouse_to_world_y() {
        return this.mouse_y + this.camera.y - this.canvas.height * 0.5
    }
    edit_begin_tile(tile) {
        this.edit_tile_uid = tile
        let tx = Math.floor(this.mouse_to_world_x() * INV_TILE_SIZE)
        let ty = Math.floor(this.mouse_to_world_y() * INV_TILE_SIZE)
        this.c_edit_tile = tx
        this.c_min_edit_tile = tx
        this.c_max_edit_tile = tx
        this.r_edit_tile = ty
        this.r_min_edit_tile = ty
        this.r_max_edit_tile = ty
        this.render()
    }
    edit_update_mouse_tile() {
        let tx = Math.floor(this.mouse_to_world_x() * INV_TILE_SIZE)
        let ty = Math.floor(this.mouse_to_world_y() * INV_TILE_SIZE)
        let render = false
        if (tx < this.c_edit_tile) {
            if (this.c_min_edit_tile != tx) {
                this.c_min_edit_tile = tx
                render = true
            }
            this.c_max_edit_tile = this.c_edit_tile
        } else {
            this.c_min_edit_tile = this.c_edit_tile
            if (this.c_max_edit_tile != tx) {
                this.c_max_edit_tile = tx
                render = true
            }
        }
        if (ty < this.r_edit_tile) {
            if (this.r_min_edit_tile != ty) {
                this.r_min_edit_tile = ty
                render = true
            }
            this.r_max_edit_tile = this.r_edit_tile
        } else {
            this.r_min_edit_tile = this.r_edit_tile
            if (this.r_max_edit_tile != ty) {
                this.r_max_edit_tile = ty
                render = true
            }
        }
        if (render) this.render()
    }
    edit_set_tile(tile) {
        let px = this.mouse_to_world_x()
        if (px < 0 || px >= this.world.block_w * GRID_SIZE) return
        let py = this.mouse_to_world_y()
        if (py < 0 || py >= this.world.block_h * GRID_SIZE) return

        let bx = Math.floor(px * INV_GRID_SIZE)
        let by = Math.floor(py * INV_GRID_SIZE)
        let tx = Math.floor(px * INV_TILE_SIZE) % BLOCK_SIZE
        let ty = Math.floor(py * INV_TILE_SIZE) % BLOCK_SIZE

        let block = this.world.blocks[bx + by * this.world.block_w]
        let index = tx + ty * BLOCK_SIZE
        let existing = block.tiles[index]

        if (tile !== existing) {
            block.tiles[index] = tile
            block.build_mesh(this.gl)
            this.render()
        }
    }
    mouse_move(event) {
        this.mouse_x = event.clientX
        this.mouse_y = this.canvas.height - event.clientY
        if (this.mouse_left) this.edit_action_move()
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
        this.render()
    }
    render() {
        let g = this.g
        let gl = this.gl
        let frame = this.frame
        let camera = this.camera
        let buttons = this.buttons
        let generic = this.generic

        let view_x = -Math.floor(camera.x - frame.width * 0.5)
        let view_y = -Math.floor(camera.y - frame.height * 0.5)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        g.set_program(gl, "texture")
        g.set_orthographic(this.draw_ortho, view_x, view_y)
        g.update_mvp(gl)
        this.world.render(g, gl, frame, camera.x, camera.y, this.sprite_buffers)
        if (this.edit_tile_uid !== null) {
            generic.zero()
            let texture = Tile.Texture(this.edit_tile_uid)

            let c_min = this.c_min_edit_tile
            let c_max = this.c_max_edit_tile
            let r_min = this.r_min_edit_tile
            let r_max = this.r_max_edit_tile
            if (c_min < 0) c_min = 0
            if (r_min < 0) r_min = 0
            if (c_max >= this.world.block_w * BLOCK_SIZE) c_max = this.world.block_w * BLOCK_SIZE - 1
            if (r_max >= this.world.block_h * BLOCK_SIZE) r_max = this.world.block_h * BLOCK_SIZE - 1
            for (let gy = r_min; gy <= r_max; gy++) {
                let yy = gy * TILE_SIZE
                for (let gx = c_min; gx <= c_max; gx++) {
                    let xx = gx * TILE_SIZE
                    Render.Image(generic, xx, yy, TILE_SIZE, TILE_SIZE, texture[0], texture[1], texture[2], texture[3])
                }
            }
            RenderSystem.UpdateAndDraw(gl, generic)
        }
        this.world.render_sprites(g, gl, this.sprite_buffers)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, this.screen)

        g.set_program(gl, "texture");
        g.set_orthographic(this.canvas_ortho, 0, 0)
        g.update_mvp(gl);
        generic.zero();
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].draw(generic);
        }
        g.set_texture(gl, "buttons");
        RenderSystem.UpdateAndDraw(gl, generic);
    }
}

let app = new Application()
app.run()

function run() {
    app.run()
}

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