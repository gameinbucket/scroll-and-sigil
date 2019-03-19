const WORLD_POSITIVE_X = 0
const WORLD_POSITIVE_Y = 1
const WORLD_POSITIVE_Z = 2
const WORLD_NEGATIVE_X = 3
const WORLD_NEGATIVE_Y = 4
const WORLD_NEGATIVE_Z = 5

const Tau = Math.PI * 2.0
const RadToDeg = 180.0 / Math.PI
const DegToRad = Math.PI / 180.0

class World {
    constructor(g, gl) {
        this.g = g
        this.gl = gl
        this.width
        this.height
        this.length
        this.slice
        this.all
        this.blocks
        this.viewable
        this.spriteSet
        this.spriteBuffer
        this.spriteCount
        this.things
        this.thingCount
        this.things_net
        this.occluder = new Occluder()
    }
    load(data) {
        this.blocks = []
        this.viewable = []
        this.spriteSet = new Set()
        this.spriteBuffer = {}
        this.spriteCount = {}
        this.things = []
        this.thingCount = 0
        this.things_net = {}

        let content = Parser.read(data)
        let blocks = content["b"]

        let left = null
        let right = null
        let top = null
        let bottom = null
        let front = null
        let back = null
        for (let b = 0; b < blocks.length; b++) {
            let data = blocks[b]
            let bx = parseInt(data["x"])
            let by = parseInt(data["y"])
            let bz = parseInt(data["z"])

            if (left === null || bx < left) left = bx
            if (right === null || bx > right) right = bx
            if (top === null || by > top) top = by
            if (bottom === null || by < bottom) bottom = by
            if (front === null || bz > front) front = bz
            if (back === null || bz < back) back = bz
        }

        this.width = right - left + 1
        this.height = top - bottom + 1
        this.length = front - back + 1
        this.slice = this.width * this.height
        this.all = this.slice * this.length

        for (let b = 0; b < blocks.length; b++) {
            let data = blocks[b]
            let bx = parseInt(data["x"]) - left
            let by = parseInt(data["y"]) - bottom
            let bz = parseInt(data["z"]) - back
            let tiles = data["t"]
            let lights = data["c"]

            let block = new Block(bx, by, bz)

            if (tiles.length > 0) {
                for (let t = 0; t < BLOCK_ALL; t++)
                    block.tiles[t].type = parseInt(tiles[t])
            }

            for (let t = 0; t < lights.length; t++) {
                let light = lights[t]
                let x = parseInt(light["x"])
                let y = parseInt(light["y"])
                let z = parseInt(light["z"])
                let rgb = parseInt(light["v"])
                block.add_light(new Light(x, y, z, rgb))
            }

            this.blocks[bx + by * this.width + bz * this.slice] = block
        }

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.length; z++) {
                    let i = x + y * this.width + z * this.slice
                    if (this.blocks[i] === null || this.blocks[i] === undefined)
                        this.blocks[i] = new Block(x, y, z)
                }
            }
        }

        for (let b = 0; b < blocks.length; b++) {
            let data = blocks[b]
            let bx = parseInt(data["x"]) - left
            let by = parseInt(data["y"]) - bottom
            let bz = parseInt(data["z"]) - back
            let things = data["e"]

            let px = bx * BLOCK_SIZE
            let py = by * BLOCK_SIZE
            let pz = bz * BLOCK_SIZE

            for (let t = 0; t < things.length; t++) {
                let thing = things[t]
                let uid = thing["u"]
                let nid = thing["n"]
                let x = parseFloat(thing["x"]) + px
                let y = parseFloat(thing["y"]) + py
                let z = parseFloat(thing["z"]) + pz
                Thing.LoadNewThing(this, uid, nid, x, y, z)
            }
        }

        this.build()
    }
    save(name) {
        let data = "n:" + name + ",b["
        for (let i = 0; i < this.all; i++) {
            let block = this.blocks[i]
            if (!block.empty()) {
                data += block.save()
                data += ","
            }
        }
        data += "]"
        return data
    }
    build() {
        for (let i = 0; i < this.all; i++) {
            let block = this.blocks[i]
            for (let j = 0; j < block.lights.length; j++)
                Light.Add(this, block, block.lights[j])
            Occluder.SetBlockVisible(block)
        }
        for (let i = 0; i < this.all; i++)
            this.blocks[i].build_mesh(this)
    }
    find_block(x, y, z) {
        let gx = Math.floor(x)
        let gy = Math.floor(y)
        let gz = Math.floor(z)
        let bx = Math.floor(gx * INV_BLOCK_SIZE)
        let by = Math.floor(gy * INV_BLOCK_SIZE)
        let bz = Math.floor(gz * INV_BLOCK_SIZE)
        let tx = gx - bx * BLOCK_SIZE
        let ty = gy - by * BLOCK_SIZE
        let tz = gz - bz * BLOCK_SIZE
        let block = this.blocks[bx + by * this.width + bz * this.slice]
        return block.tiles[tx + ty * BLOCK_SIZE + tz * BLOCK_SLICE].type
    }
    get_tile_pointer(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BLOCK_SIZE
            cx--
        }
        while (bx >= BLOCK_SIZE) {
            bx -= BLOCK_SIZE
            cx++
        }
        while (by < 0) {
            by += BLOCK_SIZE
            cy--
        }
        while (by >= BLOCK_SIZE) {
            by -= BLOCK_SIZE
            cy++
        }
        while (bz < 0) {
            bz += BLOCK_SIZE
            cz--
        }
        while (bz >= BLOCK_SIZE) {
            bz -= BLOCK_SIZE
            cz++
        }
        let block = this.get_block(cx, cy, cz)
        if (block === null)
            return null
        return block.get_tile_pointer_unsafe(bx, by, bz)
    }
    get_tile_type(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BLOCK_SIZE
            cx--
        }
        while (bx >= BLOCK_SIZE) {
            bx -= BLOCK_SIZE
            cx++
        }
        while (by < 0) {
            by += BLOCK_SIZE
            cy--
        }
        while (by >= BLOCK_SIZE) {
            by -= BLOCK_SIZE
            cy++
        }
        while (bz < 0) {
            bz += BLOCK_SIZE
            cz--
        }
        while (bz >= BLOCK_SIZE) {
            bz -= BLOCK_SIZE
            cz++
        }
        let block = this.get_block(cx, cy, cz)
        if (block === null) {
            return TILE_NONE
        }
        return block.get_tile_type_unsafe(bx, by, bz)
    }
    get_block(x, y, z) {
        if (x < 0 || x >= this.width)
            return null
        if (y < 0 || y >= this.height)
            return null
        if (z < 0 || z >= this.length)
            return null
        return this.blocks[x + y * this.width + z * this.slice]
    }
    AddThing(thing) {
        this.things[this.thingCount] = thing
        this.thingCount++
        this.things_net[thing.NID] = thing

        let count = this.spriteCount[thing.SID]
        if (count) {
            this.spriteCount[thing.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[thing.SID].vertices.length)
                this.spriteBuffer[thing.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[thing.SID])
        } else {
            this.spriteCount[thing.SID] = 1
            this.spriteBuffer[thing.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    RemoveThing(thing) {
        for (let i = 0; i < this.thingCount; i++) {
            if (this.things[i] === thing) {
                for (let j = i; j < this.thingCount - 1; j++) this.things[j] = this.things[j + 1]
                this.thingCount--
                this.spriteCount[thing.SID]--
                delete this.things_net[thing.NID]
                break
            }
        }
    }
    update() {
        for (let i = 0; i < this.thingCount; i++)
            this.things[i].Update()
    }
    render(g, interpolation, x, y, z, camX, camZ, camAngle) {
        let gl = this.gl
        let spriteSet = this.spriteSet
        let spriteBuffer = this.spriteBuffer

        this.occluder.prepare_frustum(g)
        this.occluder.occlude(this, x, y, z)

        spriteSet.clear()
        for (let key in spriteBuffer)
            spriteBuffer[key].zero()

        g.set_program(gl, "texcol3d")
        g.update_mvp(gl)
        g.set_texture(gl, "tiles")

        for (let i = 0; i < OCCLUSION_VIEW_NUM; i++) {
            let block = this.viewable[i]

            block.render_things(interpolation, spriteSet, spriteBuffer, camX, camZ, camAngle)

            let mesh = block.mesh
            if (mesh.vertex_pos === 0)
                continue

            RenderSystem.BindVao(gl, mesh)

            if (x == block.x) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_X], block.count_side[WORLD_POSITIVE_X])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_X], block.count_side[WORLD_NEGATIVE_X])
            } else if (x > block.x)
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_X], block.count_side[WORLD_POSITIVE_X])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_X], block.count_side[WORLD_NEGATIVE_X])

            if (y == block.y) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Y], block.count_side[WORLD_POSITIVE_Y])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Y], block.count_side[WORLD_NEGATIVE_Y])
            } else if (y > block.y)
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Y], block.count_side[WORLD_POSITIVE_Y])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Y], block.count_side[WORLD_NEGATIVE_Y])

            if (z == block.z) {
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Z], block.count_side[WORLD_POSITIVE_Z])
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Z], block.count_side[WORLD_NEGATIVE_Z])
            } else if (z > block.z)
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_POSITIVE_Z], block.count_side[WORLD_POSITIVE_Z])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WORLD_NEGATIVE_Z], block.count_side[WORLD_NEGATIVE_Z])
        }

        g.set_program(gl, "texture3d")
        g.update_mvp(gl)
        for (let key in spriteBuffer) {
            let buffer = spriteBuffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(gl, key)
                RenderSystem.UpdateAndDraw(gl, buffer)
            }
        }
    }
}
