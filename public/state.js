class WorldState {
    constructor(app) {
        this.app = app
        this.snapshot_time = new Date().getTime()
        this.previous_update = new Date().getTime()
    }
    update() {
        let world = this.app.world

        if (SocketQueue.length > 0) {
            let raw = SocketQueue[SocketQueue.length - 1]
            SocketQueue = []
            let data = Parser.read(raw)
            let things = data["t"]
            for (let i = 0; i < things.length; i++) {
                let snap = things[i]
                let nid = snap["n"]
                if (nid in world.thingLookup) {
                    let thing = world.thingLookup[nid]
                    thing.OX = thing.X
                    thing.OY = thing.Y
                    thing.OZ = thing.Z
                    thing.X = parseFloat(snap["x"])
                    thing.Y = parseFloat(snap["y"])
                    thing.Z = parseFloat(snap["z"])
                    if ("a" in snap) {
                        thing.Angle = parseFloat(snap["a"])
                    } else if ("d" in snap) {
                        let direction = parseInt(snap["d"])
                        if (direction !== DirectionNone)
                            thing.Angle = DirectionToAngle[direction]
                    }
                    if ("s" in snap)
                        thing.NetUpdateState(parseInt(snap["s"]))
                    if ("h" in snap)
                        thing.NetUpdateHealth(parseInt(snap["h"]))
                    thing.RemoveFromBlocks()
                    thing.BlockBorders()
                    thing.AddToBlocks()
                } else {
                    let uid = snap["u"]
                    if (uid === "plasma") {
                        let x = parseFloat(snap["x"])
                        let y = parseFloat(snap["y"])
                        let z = parseFloat(snap["z"])
                        let dx = parseFloat(snap["dx"])
                        let dy = parseFloat(snap["dy"])
                        let dz = parseFloat(snap["dz"])
                        new Plasma(world, nid, 2, x, y, z, dx, dy, dz)
                    }
                }
            }
            this.snapshot_time = parseInt(data["s"]) + 1552330000000
            this.previous_update = new Date().getTime()
        }

        world.update()

        if (SocketSend.length > 0) {
            SOCKET.send(SocketSend)
            SocketSend = ""
        }
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
        let interpolation = (time - this.previous_update) / NetworkUpdateRate
        if (interpolation > 1.0) interpolation = 1.0
        // console.log(time, this.previous_update, this.snapshot_time, interpolation)

        cam.update(interpolation)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        g.set_perspective(draw_perspective, -cam.x, -cam.y, -cam.z, cam.rx, cam.ry)
        Matrix.Inverse(g.iv, g.v)

        let cam_block_x = Math.floor(cam.x * InverseBlockSize)
        let cam_block_y = Math.floor(cam.y * InverseBlockSize)
        let cam_block_z = Math.floor(cam.z * InverseBlockSize)

        world.render(g, interpolation, cam_block_x, cam_block_y, cam_block_z, cam.x, cam.z, cam.ry)

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
