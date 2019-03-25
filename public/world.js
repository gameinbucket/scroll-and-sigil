const NetworkUpdateRate = 50

const WorldPositiveX = 0
const WorldPositiveY = 1
const WorldPositiveZ = 2
const WorldNegativeX = 3
const WorldNegativeY = 4
const WorldNegativeZ = 5

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
        this.thingCount
        this.itemCount
        this.missileCount
        this.particleCount
        this.things
        this.items
        this.missiles
        this.particles
        this.thingLookup
        this.itemLookup
        this.missileLookup
        this.occluder = new Occluder()
        this.PID = ""
    }
    load(data) {
        this.blocks = []
        this.viewable = []
        this.spriteSet = new Set()
        this.spriteBuffer = {}
        this.spriteCount = {}
        this.thingCount = 0
        this.itemCount = 0
        this.missileCount = 0
        this.particleCount = 0
        this.things = []
        this.items = []
        this.missiles = []
        this.particles = []
        this.thingLookup = {}
        this.itemLookup = {}
        this.missileLookup = {}

        let content = Parser.read(data)
        let blocks = content["b"]

        this.PID = content["p"]

        console.log(content)

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
                block.AddLight(new Light(x, y, z, rgb))
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
            let things = data["e"]
            let items = data["i"]
            let missiles = data["m"]

            for (let t = 0; t < things.length; t++) {
                let thing = things[t]
                let uid = thing["u"]
                let nid = thing["n"]
                let x = parseFloat(thing["x"])
                let y = parseFloat(thing["y"])
                let z = parseFloat(thing["z"])
                Thing.LoadNewThing(this, uid, nid, x, y, z)
            }

            for (let t = 0; t < items.length; t++) {
                let item = items[t]
                let uid = item["u"]
                let nid = item["n"]
                let x = parseFloat(item["x"])
                let y = parseFloat(item["y"])
                let z = parseFloat(item["z"])
                Item.LoadNewItem(this, uid, nid, x, y, z)
            }

            for (let t = 0; t < missiles.length; t++) {
                let missile = missiles[t]
                let uid = missile["u"]
                let nid = missile["n"]
                let x = parseFloat(missile["x"])
                let y = parseFloat(missile["y"])
                let z = parseFloat(missile["z"])
                Missile.LoadNewMissile(this, uid, nid, x, y, z)
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
            this.blocks[i].BuildMesh(this)
    }
    FindBlock(x, y, z) {
        let gx = Math.floor(x)
        let gy = Math.floor(y)
        let gz = Math.floor(z)
        let bx = Math.floor(gx * InverseBlockSize)
        let by = Math.floor(gy * InverseBlockSize)
        let bz = Math.floor(gz * InverseBlockSize)
        let tx = gx - bx * BlockSize
        let ty = gy - by * BlockSize
        let tz = gz - bz * BlockSize
        let block = this.blocks[bx + by * this.width + bz * this.slice]
        return block.tiles[tx + ty * BlockSize + tz * BLOCK_SLICE].type
    }
    GetTilePointer(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BlockSize
            cx--
        }
        while (bx >= BlockSize) {
            bx -= BlockSize
            cx++
        }
        while (by < 0) {
            by += BlockSize
            cy--
        }
        while (by >= BlockSize) {
            by -= BlockSize
            cy++
        }
        while (bz < 0) {
            bz += BlockSize
            cz--
        }
        while (bz >= BlockSize) {
            bz -= BlockSize
            cz++
        }
        let block = this.GetBlock(cx, cy, cz)
        if (block === null)
            return null
        return block.GetTilePointerUnsafe(bx, by, bz)
    }
    GetTileType(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BlockSize
            cx--
        }
        while (bx >= BlockSize) {
            bx -= BlockSize
            cx++
        }
        while (by < 0) {
            by += BlockSize
            cy--
        }
        while (by >= BlockSize) {
            by -= BlockSize
            cy++
        }
        while (bz < 0) {
            bz += BlockSize
            cz--
        }
        while (bz >= BlockSize) {
            bz -= BlockSize
            cz++
        }
        let block = this.GetBlock(cx, cy, cz)
        if (block === null) {
            return TILE_NONE
        }
        return block.GetTileTypeUnsafe(bx, by, bz)
    }
    GetBlock(x, y, z) {
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
        this.thingLookup[thing.NID] = thing

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
    AddItem(item) {
        this.items[this.itemCount] = item
        this.itemCount++
        this.itemLookup[item.NID] = item

        let count = this.spriteCount[item.SID]
        if (count) {
            this.spriteCount[item.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[item.SID].vertices.length)
                this.spriteBuffer[item.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[item.SID])
        } else {
            this.spriteCount[item.SID] = 1
            this.spriteBuffer[item.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    AddMissile(missile) {
        this.missiles[this.missileCount] = missile
        this.missileCount++
        this.missileLookup[missile.NID] = missile

        let count = this.spriteCount[missile.SID]
        if (count) {
            this.spriteCount[missile.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[missile.SID].vertices.length)
                this.spriteBuffer[missile.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[missile.SID])
        } else {
            this.spriteCount[missile.SID] = 1
            this.spriteBuffer[missile.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    AddParticle(particle) {
        this.particles[this.particleCount] = particle
        this.particleCount++

        let count = this.spriteCount[particle.SID]
        if (count) {
            this.spriteCount[particle.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[particle.SID].vertices.length)
                this.spriteBuffer[particle.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[particle.SID])
        } else {
            this.spriteCount[particle.SID] = 1
            this.spriteBuffer[particle.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    RemoveThing(thing) {
        let len = this.thingCount
        for (let i = 0; i < len; i++) {
            if (this.things[i] === thing) {
                this.things[i] = this.things[len - 1]
                this.things[len - 1] = null
                this.thingCount--
                this.spriteCount[thing.SID]--
                delete this.thingLookup[thing.NID]
                break
            }
        }
    }
    RemoveItem(item) {
        let len = this.itemCount
        for (let i = 0; i < len; i++) {
            if (this.items[i] === item) {
                this.items[i] = this.items[len - 1]
                this.items[len - 1] = null
                this.itemCount--
                this.spriteCount[item.SID]--
                delete this.itemLookup[item.NID]
                break
            }
        }
    }
    RemoveMissile(missile) {
        let len = this.missileCount
        for (let i = 0; i < len; i++) {
            if (this.missiles[i] === missile) {
                this.missiles[i] = this.missiles[len - 1]
                this.missiles[len - 1] = null
                this.missileCount--
                this.spriteCount[missile.SID]--
                delete this.missileLookup[missile.NID]
                break
            }
        }
    }
    RemoveParticle(particle) {
        let len = this.particleCount
        for (let i = 0; i < len; i++) {
            if (this.particles[i] === particle) {
                this.particles[i] = this.particles[len - 1]
                this.particles[len - 1] = null
                this.particleCount--
                this.spriteCount[particle.SID]--
                break
            }
        }
    }
    update() {
        let len = this.thingCount
        for (let i = 0; i < len; i++)
            this.things[i].Update()
        len = this.missileCount
        for (let i = 0; i < len; i++) {
            if (this.missiles[i].Update()) {
                this.missiles[i] = this.missiles[len - 1]
                this.missiles[len - 1] = null
                this.missileCount--
                len--
                i--
            }
        }
        len = this.particleCount
        for (let i = 0; i < this.particleCount; i++) {
            if (this.particles[i].Update()) {
                this.particles[i] = this.particles[len - 1]
                this.particles[len - 1] = null
                this.particleCount--
                len--
                i--

            }
        }
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

            block.RenderThings(interpolation, spriteSet, spriteBuffer, camX, camZ, camAngle)

            let mesh = block.mesh
            if (mesh.vertex_pos === 0)
                continue

            RenderSystem.BindVao(gl, mesh)

            if (x == block.x) {
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveX], block.count_side[WorldPositiveX])
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeX], block.count_side[WorldNegativeX])
            } else if (x > block.x)
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveX], block.count_side[WorldPositiveX])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeX], block.count_side[WorldNegativeX])

            if (y == block.y) {
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveY], block.count_side[WorldPositiveY])
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeY], block.count_side[WorldNegativeY])
            } else if (y > block.y)
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveY], block.count_side[WorldPositiveY])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeY], block.count_side[WorldNegativeY])

            if (z == block.z) {
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveZ], block.count_side[WorldPositiveZ])
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeZ], block.count_side[WorldNegativeZ])
            } else if (z > block.z)
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveZ], block.count_side[WorldPositiveZ])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeZ], block.count_side[WorldNegativeZ])
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
