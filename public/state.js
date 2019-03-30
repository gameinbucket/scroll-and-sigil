class WorldState {
    constructor(app) {
        this.app = app
        this.snapshotTime = new Date().getTime()
        this.previousUpdate = new Date().getTime()
    }
    update() {
        let world = this.app.world

        if (SocketQueue.length > 0) {
            let raw = SocketQueue[SocketQueue.length - 1]
            SocketQueue = []

            let dat = new DataView(raw)
            let dex = 0

            let serverTime = dat.getUint32(dex, true)
            dex += 4

            let thingCount = dat.getUint16(dex, true)
            dex += 2
            for (let t = 0; t < thingCount; t++) {
                let nid = dat.getUint16(dex, true)
                dex += 2
                let thing = world.thingLookup[nid]
                if (thing) {
                    thing.OX = thing.X
                    thing.OY = thing.Y
                    thing.OZ = thing.Z
                    switch (thing.UID) {
                        case HumanUID:
                            {
                                thing.X = dat.getFloat32(dex, true)
                                dex += 4
                                thing.Y = dat.getFloat32(dex, true)
                                dex += 4
                                thing.Z = dat.getFloat32(dex, true)
                                dex += 4
                                thing.Angle = dat.getFloat32(dex, true)
                                dex += 4
                                let health = dat.getUint16(dex, true)
                                dex += 2
                                thing.NetUpdateHealth(health)
                            }
                            continue
                        case BaronUID:
                            {
                                thing.X = dat.getFloat32(dex, true)
                                dex += 4
                                thing.Y = dat.getFloat32(dex, true)
                                dex += 4
                                thing.Z = dat.getFloat32(dex, true)
                                dex += 4
                                let direction = dat.getUint8(dex, true)
                                dex += 1
                                let health = dat.getUint16(dex, true)
                                dex += 2
                                let status = dat.getUint8(dex, true)
                                dex += 1
                                if (direction !== DirectionNone)
                                    thing.Angle = DirectionToAngle[direction]
                                thing.NetUpdateState(status)
                                thing.NetUpdateHealth(health)
                            }
                            continue
                    }
                    thing.RemoveFromBlocks()
                    thing.BlockBorders()
                    thing.AddToBlocks()
                } else {
                    console.log("error: missing thing!", nid)
                    console.log(world.thingLookup)
                }
            }

            // let data = Parser.read(raw)
            let data = {}
            data["s"] = 1
            data["t"] = []

            if ("b" in data) {
                let broadcast = data["b"]
                for (let i = 0; i < broadcast.length; i++) {
                    let snap = broadcast[i]
                    if ("del" in snap) {
                        let nid = snap["del"]
                        let thing = world.thingLookup[nid]
                        if (thing) {
                            console.log("REMOVING THING")
                            world.RemoveThing(thing)
                            thing.RemoveFromBlocks()
                        }
                    } else {
                        let nid = snap["n"]
                        if (!(nid in world.thingLookup)) {
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
                }
            }

            let things = data["t"]
            for (let i = 0; i < things.length; i++) {
                let snap = things[i]
                let nid = snap["n"]
                let thing = world.thingLookup[nid]
                if (thing) {
                    thing.OX = thing.X
                    thing.OY = thing.Y
                    thing.OZ = thing.Z

                    if ("x" in snap) {
                        thing.X = parseFloat(snap["x"])
                        thing.Z = parseFloat(snap["z"])
                    }
                    if ("y" in snap) {
                        thing.Y = parseFloat(snap["y"])
                    }
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
                    console.log("error: missing thing!")
                }
            }

            this.snapshotTime = serverTime + 1552330000000
            this.previousUpdate = new Date().getTime()
        }

        world.update()

        if (SocketSend.length > 0) {
            SocketConnection.send(SocketSend)
            SocketSend = ""
        }
    }
    render() {
        let g = this.app.g
        let gl = this.app.gl
        let frame = this.app.frame
        let canvas = this.app.canvas
        let canvasOrtho = this.app.canvasOrtho
        let drawPerspective = this.app.drawPerspective
        let screen = this.app.screen
        let world = this.app.world
        let cam = this.app.camera

        let time = new Date().getTime()
        let interpolation = (time - this.previousUpdate) / NetworkUpdateRate
        if (interpolation > 1.0) interpolation = 1.0
        // console.log(time, this.previousUpdate, this.snapshotTime, interpolation)

        cam.update(interpolation)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        g.set_perspective(drawPerspective, -cam.x, -cam.y, -cam.z, cam.rx, cam.ry)
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
        g.set_orthographic(canvasOrtho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, screen)
    }
}
