class WorldState {
    constructor(app) {
        this.app = app
    }
    update() {
        let cam = this.app.camera
        // let pace = 0.1
        // if (Input.Is("w")) {
        //     cam.x += Math.sin(cam.ry) * pace
        //     cam.z -= Math.cos(cam.ry) * pace
        // }
        // if (Input.Is("s")) {
        //     cam.x -= Math.sin(cam.ry) * pace
        //     cam.z += Math.cos(cam.ry) * pace
        // }
        // if (Input.Is("a")) {
        //     cam.x -= Math.cos(cam.ry) * pace
        //     cam.z -= Math.sin(cam.ry) * pace
        // }
        // if (Input.Is("d")) {
        //     cam.x += Math.cos(cam.ry) * pace
        //     cam.z += Math.sin(cam.ry) * pace
        // }
        // if (Input.Is("q"))
        //     cam.y += 0.1
        // if (Input.Is("e"))
        //     cam.y -= 0.1
        if (Input.Is("ArrowLeft"))
            cam.ry -= 0.05
        if (Input.Is("ArrowRight"))
            cam.ry += 0.05
        if (Input.Is("ArrowUp"))
            cam.rx -= 0.05
        if (Input.Is("ArrowDown"))
            cam.rx += 0.05

        this.app.world.update()
        cam.update();
    }
    render() {
        let g = this.app.g
        let gl = this.app.gl
        let frame = this.app.frame
        let canvas = this.app.canvas
        let player = this.app.player
        let generic = this.app.generic
        let generic2 = this.app.generic2
        let colored = this.app.colored
        let canvas_ortho = this.app.canvas_ortho
        let draw_ortho = this.app.draw_ortho
        let draw_perspective = this.app.draw_perspective
        let screen = this.app.screen
        let world = this.app.world
        let cam = this.app.camera

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

        world.render(g, cam_block_x, cam_block_y, cam_block_z, cam.x, cam.z)

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
