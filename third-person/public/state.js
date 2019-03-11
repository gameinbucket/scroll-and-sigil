class WorldState {
    constructor(app) {
        this.app = app
        this.previous_update = new Date().getTime()
    }
    update() {
        let cam = this.app.camera
        let world = this.app.world

        if (Input.Is("ArrowLeft"))
            cam.ry += 0.05
        if (Input.Is("ArrowRight"))
            cam.ry -= 0.05
        if (Input.Is("ArrowUp"))
            cam.rx += 0.05
        if (Input.Is("ArrowDown"))
            cam.rx -= 0.05

        if (SOCKET_QUEUE.length > 0) {
            let data = SOCKET_QUEUE[SOCKET_QUEUE.length - 1]
            SOCKET_QUEUE = []
            let map = Parser.read(data)
            console.log(data, map)
            let things = map["t"]
            for (let i = 0; i < things.length; i++) {
                let snap = things[i]
                let nid = snap["n"]
                let thing = world.things_net[nid]
                thing.x = parseFloat(snap["x"])
                thing.y = parseFloat(snap["y"])
                thing.z = parseFloat(snap["z"])
                thing.remove_from_blocks(world)
                thing.block_borders()
                thing.add_to_blocks(world)
            }
            this.previous_update = new Date().getTime()
        }

        world.update()
        cam.update()
    }
    render() {
        let g = this.app.g
        let gl = this.app.gl
        let frame = this.app.frame
        let canvas = this.app.canvas
        let canvas_ortho = this.app.canvas_ortho
        let draw_perspective = this.app.draw_perspective
        let screen = this.app.screen
        let world = this.app.world
        let cam = this.app.camera

        let time = new Date().getTime()
        let interpolation = (time - this.previous_update) / NETWORK_UPDATE_RATE
        if (interpolation > 1.0) interpolation = 1.0
        // console.log(time, this.previous_update, NETWORK_UPDATE_RATE, interpolation)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        g.set_perspective(draw_perspective, -cam.x, -cam.y, -cam.z, cam.rx, cam.ry)
        Matrix.Inverse(g.iv, g.v)

        let cam_block_x = Math.floor(cam.x * INV_BLOCK_SIZE)
        let cam_block_y = Math.floor(cam.y * INV_BLOCK_SIZE)
        let cam_block_z = Math.floor(cam.z * INV_BLOCK_SIZE)

        world.render(g, interpolation, cam_block_x, cam_block_y, cam_block_z, cam.x, cam.z)

        gl.disable(gl.DEPTH_TEST)
        gl.disable(gl.CULL_FACE)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, canvas.width, canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, screen)
    }
}
