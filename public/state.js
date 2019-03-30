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
                            break
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
                            break
                    }
                    thing.RemoveFromBlocks()
                    thing.BlockBorders()
                    thing.AddToBlocks()
                } else {
                    console.log("error: missing thing!", nid)
                    console.log(world.thingLookup)
                }
            }

            let broadcastCount = dat.getUint8(dex, true)
            dex += 1
            for (let b = 0; b < broadcastCount; b++) {
                let broadcastType = dat.getUint8(dex, true)
                dex += 1
                switch (broadcastType) {
                    case BroadcastNew:
                        {
                            let uid = dat.getUint16(dex, true)
                            dex += 2
                            let nid = dat.getUint16(dex, true)
                            dex += 2
                            if (uid === PlasmaUID) {
                                let x = dat.getFloat32(dex, true)
                                dex += 4
                                let y = dat.getFloat32(dex, true)
                                dex += 4
                                let z = dat.getFloat32(dex, true)
                                dex += 4
                                let dx = dat.getFloat32(dex, true)
                                dex += 4
                                let dy = dat.getFloat32(dex, true)
                                dex += 4
                                let dz = dat.getFloat32(dex, true)
                                dex += 4
                                let damage = dat.getUint16(dex, true)
                                dex += 2
                                new Plasma(world, nid, damage, x, y, z, dx, dy, dz)
                            }
                        }
                        break
                    case BroadcastDelete:
                        {
                            console.log("broadcast delete")
                            let nid = dat.getUint16(dex, true)
                            dex += 2
                            // TODO need to have separate thing / missile lookup based on UID
                            let thing = world.thingLookup[nid]
                            if (thing) {
                                console.log("removing thing")
                                world.RemoveThing(thing)
                                thing.RemoveFromBlocks()
                            } else {
                                console.log("missing nid", nid, " to delete")
                            }
                        }
                        break
                }
            }

            this.snapshotTime = serverTime + 1552330000000
            this.previousUpdate = new Date().getTime()
        }

        world.update()

        if (SocketSendOperations > 0) {
            let buffer = SocketSend.buffer.slice(0, SocketSendIndex)
            let view = new DataView(buffer)
            view.setUint8(0, SocketSendOperations, true)

            SocketConnection.send(buffer)
            SocketSendIndex = 1
            SocketSendOperations = 0
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
