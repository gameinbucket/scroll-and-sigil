class EditState {
    constructor(app) {
        this.app = app
        this.name = "temp"
        this.editMode = "add"
        this.editTileType = TileGrass
    }
    update() {
        let world = this.app.world
        let cam = this.app.camera

        cam.update()

        if (Input.KeyPress("i")) {
            this.editMode = "add"
        }

        if (Input.KeyPress("r")) {
            this.editMode = "replace"
        }

        if (Input.KeyPress("c")) {
            this.editMode = "delete"
        }

        let distance = 10.0
        let toX = cam.X + distance * Math.sin(cam.RY)
        let toY = cam.Y - distance * Math.sin(cam.RX)
        let toZ = cam.Z - distance * Math.cos(cam.RY)

        Cast.World(world, cam.X, cam.Y, cam.Z, toX, toY, toZ)

        if (CastTileType !== null && Input.KeyPress(" ")) {
            if (this.editMode === "add") {
                let x = CastX
                let y = CastY
                let z = CastZ
                switch (CastSide) {
                    case WorldNegativeX:
                        x--
                        if (x < 0) CastTileType = null
                        break
                    case WorldPositiveX:
                        x++
                        if (x >= world.tileWidth) CastTileType = null
                        break
                    case WorldNegativeY:
                        y--
                        if (y < 0) CastTileType = null
                        break
                    case WorldPositiveY:
                        y++
                        if (y >= world.tileHeigh) CastTileType = null
                        break
                    case WorldNegativeZ:
                        z--
                        if (z < 0) CastTileType = null
                        break
                    case WorldPositiveZ:
                        z++
                        if (z >= world.tileLength) CastTileType = null
                        break
                }
                if (CastTileType !== null) {
                    let bx = Math.floor(x * InverseBlockSize)
                    let by = Math.floor(y * InverseBlockSize)
                    let bz = Math.floor(z * InverseBlockSize)
                    let tx = x - bx * BlockSize
                    let ty = y - by * BlockSize
                    let tz = z - bz * BlockSize
                    let block = world.blocks[bx + by * world.width + bz * world.slice]
                    let tile = block.tiles[tx + ty * BlockSize + tz * BlockSlice]
                    if (tile.type !== this.editTileType) {
                        tile.type = this.editTileType
                        block.BuildMesh(world)
                    }
                }
            } else {
                let bx = Math.floor(CastX * InverseBlockSize)
                let by = Math.floor(CastY * InverseBlockSize)
                let bz = Math.floor(CastZ * InverseBlockSize)
                let tx = CastX - bx * BlockSize
                let ty = CastY - by * BlockSize
                let tz = CastZ - bz * BlockSize
                let block = world.blocks[bx + by * world.width + bz * world.slice]
                let tile = block.tiles[tx + ty * BlockSize + tz * BlockSlice]
                if (this.editMode === "delete") {
                    if (tile.type !== TileNone) {
                        tile.type = TileNone
                        block.BuildMesh(world)
                    }
                } else if (this.editMode === "replace") {
                    if (tile.type !== this.editTileType) {
                        tile.type = this.editTileType
                        block.BuildMesh(world)
                    }
                }
            }
        }

        if (Input.KeyPress("m")) {
            this.pressSave = false
            if (this.name !== "") {
                let data = world.Save()
                console.log(data)
                Net.Send("map", this.name + ":" + data)
            }
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

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        g.set_perspective(drawPerspective, -cam.X, -cam.Y, -cam.Z, cam.RX, cam.RY)
        Matrix.Inverse(g.iv, g.v)

        let camBlockX = Math.floor(cam.X * InverseBlockSize)
        let camBlockY = Math.floor(cam.Y * InverseBlockSize)
        let camBlockZ = Math.floor(cam.Z * InverseBlockSize)

        world.render(g, camBlockX, camBlockY, camBlockZ, cam.X, cam.Z, cam.RY)

        if (CastTileType !== null) {
            // TODO render outline
        }

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
