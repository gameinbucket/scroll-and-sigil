class WorldState {
    constructor(app) {
        this.app = app
        this.snapshotTime = new Date().getTime()
        this.previousUpdate = new Date().getTime()
    }
    serverUpdates() {
        let world = this.app.world

        for (let i = 0; i < SocketQueue.length; i++) {
            let dat = new DataView(SocketQueue[i])
            let dex = 0

            let serverTime = dat.getUint32(dex, true)
            dex += 4

            this.snapshotTime = serverTime + 1552330000000
            this.previousUpdate = new Date().getTime()

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
                            if (world.netLookup.has(nid))
                                break
                            let x = dat.getFloat32(dex, true)
                            dex += 4
                            let y = dat.getFloat32(dex, true)
                            dex += 4
                            let z = dat.getFloat32(dex, true)
                            dex += 4
                            if (uid === PlasmaUID) {
                                let dx = dat.getFloat32(dex, true)
                                dex += 4
                                let dy = dat.getFloat32(dex, true)
                                dex += 4
                                let dz = dat.getFloat32(dex, true)
                                dex += 4
                                let damage = dat.getUint16(dex, true)
                                dex += 2
                                new Plasma(world, nid, damage, x, y, z, dx, dy, dz)
                            } else if (uid === HumanUID) {
                                let angle = dat.getFloat32(dex, true)
                                dex += 4
                                let health = dat.getUint16(dex, true)
                                dex += 2
                                let status = dat.getUint8(dex, true)
                                dex += 1
                                new Human(world, nid, x, y, z, angle, health, status)
                            } else {
                                throw new Error("missing new uid " + uid)
                            }
                        }
                        break
                    case BroadcastDelete:
                        {
                            let nid = dat.getUint16(dex, true)
                            dex += 2
                            let entity = world.netLookup.get(nid)
                            if (entity) entity.Cleanup()
                            else throw new Error("missing nid " + nid + " to delete")
                        }
                        break
                }
            }

            let thingCount = dat.getUint16(dex, true)
            dex += 2
            for (let t = 0; t < thingCount; t++) {
                let nid = dat.getUint16(dex, true)
                dex += 2
                let delta = dat.getUint8(dex, true)
                dex += 1
                let thing = world.netLookup.get(nid)
                if (thing) {
                    if (delta & 0x1) {
                        thing.NetX = dat.getFloat32(dex, true)
                        thing.DeltaNetX = (thing.NetX - thing.X) * InverseNetRate
                        dex += 4
                        thing.NetZ = dat.getFloat32(dex, true)
                        thing.DeltaNetZ = (thing.NetZ - thing.Z) * InverseNetRate
                        dex += 4
                    }
                    if (delta & 0x2) {
                        thing.NetY = dat.getFloat32(dex, true)
                        thing.DeltaNetY = (thing.NetY - thing.Y) * InverseNetRate
                        dex += 4
                    }
                    if (delta & 0x4) {
                        let health = dat.getUint16(dex, true)
                        dex += 2
                        thing.NetUpdateHealth(health)
                    }
                    if (delta & 0x8) {
                        let status = dat.getUint8(dex, true)
                        dex += 1
                        thing.NetUpdateState(status)
                    }
                    switch (thing.UID) {
                        case HumanUID:
                            if (delta & 0x10) {
                                thing.Angle = dat.getFloat32(dex, true)
                                dex += 4
                            }
                            break
                        case BaronUID:
                            if (delta & 0x10) {
                                let direction = dat.getUint8(dex, true)
                                dex += 1
                                if (direction !== DirectionNone)
                                    thing.Angle = DirectionToAngle[direction]
                            }
                            break
                    }
                } else {
                    throw new Error("missing thing nid " + nid)
                }
            }
        }
    }
    update() {
        let world = this.app.world

        if (SocketQueue.length > 0) {
            this.serverUpdates()
            SocketQueue = []
        }

        world.update()

        for (var [op, value] of SocketSendSet) {
            SocketSend.setUint8(SocketSendIndex, op, true)
            SocketSendIndex++
            if (op === InputOpNewMove) {
                SocketSend.setFloat32(SocketSendIndex, value, true)
                SocketSendIndex += 4
            }
            SocketSendOperations++
        }
        if (SocketSendOperations > 0) {
            let buffer = SocketSend.buffer.slice(0, SocketSendIndex)
            let view = new DataView(buffer)
            view.setUint8(0, SocketSendOperations, true)
            SocketConnection.send(buffer)
            SocketSendIndex = 1
            SocketSendOperations = 0
            SocketSendSet.clear()
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

        cam.update()

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        g.SetPerspective(drawPerspective, -cam.x, -cam.y, -cam.z, cam.rx, cam.ry)
        Matrix.Inverse(g.iv, g.v)

        let camBlockX = Math.floor(cam.x * InverseBlockSize)
        let camBlockY = Math.floor(cam.y * InverseBlockSize)
        let camBlockZ = Math.floor(cam.z * InverseBlockSize)

        world.render(g, camBlockX, camBlockY, camBlockZ, cam.x, cam.z, cam.ry)

        gl.disable(gl.DEPTH_TEST)
        gl.disable(gl.CULL_FACE)

        // TODO sky texture

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, canvas.width, canvas.height)
        g.SetProgram(gl, "texture")
        g.SetOrthographic(canvasOrtho, 0, 0)
        g.UpdateMvp(gl)
        g.SetTextureDirect(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, screen)
    }
}
