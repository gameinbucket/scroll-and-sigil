const BlockSize = 8
const InverseBlockSize = 1.0 / BlockSize

const BLOCK_SLICE = BlockSize * BlockSize
const BLOCK_ALL = BLOCK_SLICE * BlockSize
const BLOCK_MESH = new RenderCopy(3, 3, 2, BLOCK_ALL * 6 * 4, BLOCK_ALL * 6 * 6)
const BLOCK_MESH_AMBIENT = new Array(BLOCK_ALL)
for (let i = 0; i < BLOCK_ALL; i++) {
    BLOCK_MESH_AMBIENT[i] = new Array(6)
    for (let j = 0; j < 6; j++) {
        BLOCK_MESH_AMBIENT[i][j] = new Uint8Array(4)
    }
}
const BLOCK_COLOR_DIM = BlockSize + 1
const BLOCK_COLOR_SLICE = BLOCK_COLOR_DIM * BLOCK_COLOR_DIM
const BLOCK_MESH_COLOR = new Array(BLOCK_COLOR_DIM * BLOCK_COLOR_SLICE)
for (let i = 0; i < BLOCK_MESH_COLOR.length; i++) {
    BLOCK_MESH_COLOR[i] = new Uint8Array(3)
}
const SLICE_X = [2, 1, 0, 2, 1, 0]
const SLICE_Y = [0, 2, 1, 0, 2, 1]
const SLICE_Z = [1, 0, 2, 1, 0, 2]
const SLICE_TOWARDS = [1, 1, 1, -1, -1, -1]
const SLICE = new Array(3)
const SLICE_TEMP = new Array(3)

class Block {
    constructor(px, py, pz) {
        this.x = px
        this.y = py
        this.z = pz
        this.mesh
        this.visibility = new Uint8Array(36)
        this.begin_side = new Array(6)
        this.count_side = new Array(6)
        this.thingCount = 0
        this.itemCount = 0
        this.missileCount = 0
        this.particleCount = 0
        this.things = []
        this.items = []
        this.missiles = []
        this.particles = []
        this.lights = []
        this.light_count = 0
        this.tiles = []
        for (let t = 0; t < BLOCK_ALL; t++)
            this.tiles[t] = new Tile()
    }
    save() {
        let data = "{x:" + this.x + ",y:" + this.y + ",z:" + this.z + ",t["
        for (let i = 0; i < BLOCK_ALL; i++) {
            data += this.tiles[i].type
            data += ","
        }
        data += "],e["
        if (this.thingCount > 0) {
            let x = this.x * BlockSize
            let y = this.y * BlockSize
            let z = this.z * BlockSize
            for (let i = 0; i < this.thingCount; i++) {
                data += this.things[i].save(x, y, z)
                data += ","
            }
        }
        data += "],c["
        for (let i = 0; i < this.lights.length; i++) {
            data += this.lights[i].save()
            data += ","
        }
        data += "]}"
        return data
    }
    empty() {
        if (this.thingCount > 0)
            return false
        for (let i = 0; i < BLOCK_ALL; i++)
            if (this.tiles[i].type !== TILE_NONE)
                return false
        return true
    }
    GetTilePointerUnsafe(x, y, z) {
        return this.tiles[x + y * BlockSize + z * BLOCK_SLICE]
    }
    GetTileTypeUnsafe(x, y, z) {
        return this.tiles[x + y * BlockSize + z * BLOCK_SLICE].type
    }
    AddThing(thing) {
        this.things[this.thingCount] = thing
        this.thingCount++
    }
    AddItem(item) {
        this.items[this.itemCount] = item
        this.itemCount++
    }
    AddMissile(missile) {
        this.missiles[this.missileCount] = missile
        this.missileCount++
    }
    AddParticle(particle) {
        this.particles[this.particleCount] = particle
        this.particleCount++
    }
    RemoveThing(thing) {
        let len = this.thingCount
        for (let i = 0; i < len; i++) {
            if (this.things[i] === thing) {
                this.things[i] = this.things[len - 1]
                this.things[len - 1] = null
                this.thingCount--
                return
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
                break
            }
        }
    }
    AddLight(light) {
        this.lights[this.light_count] = light
        this.light_count++
    }
    RemoveLight(light) {
        for (let i = 0; i < this.light_count; i++) {
            if (this.lights[i] === light) {
                for (let j = i; j < this.light_count - 1; j++)
                    this.lights[j] = this.lights[j + 1]
                this.light_count--
                return
            }
        }
    }
    AmbientMesh(world) {
        for (let bz = 0; bz < BlockSize; bz++) {
            for (let by = 0; by < BlockSize; by++) {
                for (let bx = 0; bx < BlockSize; bx++) {
                    let index = bx + by * BlockSize + bz * BLOCK_SLICE
                    if (this.tiles[index].type === TILE_NONE)
                        continue

                    let ao_mmz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by - 1, bz)]
                    let ao_mmm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)]
                    let ao_mmp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by - 1, bz + 1)]
                    let ao_mzp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by, bz + 1)]
                    let ao_mzm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by, bz - 1)]
                    let ao_mpz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by + 1, bz)]
                    let ao_mpp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by + 1, bz + 1)]
                    let ao_mpm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by + 1, bz - 1)]
                    let ao_zpp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by + 1, bz + 1)]
                    let ao_zmp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by - 1, bz + 1)]
                    let ao_zpm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by + 1, bz - 1)]
                    let ao_zmm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by - 1, bz - 1)]
                    let ao_ppz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by + 1, bz)]
                    let ao_pmz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by - 1, bz)]
                    let ao_pzp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by, bz + 1)]
                    let ao_pzm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by, bz - 1)]
                    let ao_pmm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by - 1, bz - 1)]
                    let ao_ppm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by + 1, bz - 1)]
                    let ao_ppp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by + 1, bz + 1)]
                    let ao_pmp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by - 1, bz + 1)]

                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][0] = Tile.Ambient(ao_pmz, ao_pzm, ao_pmm)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][1] = Tile.Ambient(ao_ppz, ao_pzm, ao_ppm)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][2] = Tile.Ambient(ao_ppz, ao_pzp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][3] = Tile.Ambient(ao_pmz, ao_pzp, ao_pmp)

                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][0] = Tile.Ambient(ao_mmz, ao_mzm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][1] = Tile.Ambient(ao_mmz, ao_mzp, ao_mmp)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][2] = Tile.Ambient(ao_mpz, ao_mzp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][3] = Tile.Ambient(ao_mpz, ao_mzm, ao_mpm)

                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][0] = Tile.Ambient(ao_mpz, ao_zpm, ao_mpm)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][1] = Tile.Ambient(ao_mpz, ao_zpp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][2] = Tile.Ambient(ao_ppz, ao_zpp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][3] = Tile.Ambient(ao_ppz, ao_zpm, ao_ppm)

                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][0] = Tile.Ambient(ao_mmz, ao_zmm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][1] = Tile.Ambient(ao_pmz, ao_zmm, ao_pmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][2] = Tile.Ambient(ao_pmz, ao_zmp, ao_pmp)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][3] = Tile.Ambient(ao_mmz, ao_zmp, ao_mmp)

                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][0] = Tile.Ambient(ao_pzp, ao_zmp, ao_pmp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][1] = Tile.Ambient(ao_pzp, ao_zpp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][2] = Tile.Ambient(ao_mzp, ao_zpp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][3] = Tile.Ambient(ao_mzp, ao_zmp, ao_mmp)

                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][0] = Tile.Ambient(ao_mzm, ao_zmm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][1] = Tile.Ambient(ao_mzm, ao_zpm, ao_mpm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][2] = Tile.Ambient(ao_pzm, ao_zpm, ao_ppm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][3] = Tile.Ambient(ao_pzm, ao_zmm, ao_pmm)
                }
            }
        }
    }
    ColorMesh(world) {
        for (let bz = 0; bz < BLOCK_COLOR_DIM; bz++) {
            for (let by = 0; by < BLOCK_COLOR_DIM; by++) {
                for (let bx = 0; bx < BLOCK_COLOR_DIM; bx++) {
                    let color = [0, 0, 0, 0]

                    let block_zzz = world.GetTilePointer(this.x, this.y, this.z, bx, by, bz)
                    let block_mzz = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by, bz)
                    let block_mzm = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by, bz - 1)
                    let block_zzm = world.GetTilePointer(this.x, this.y, this.z, bx, by, bz - 1)
                    let block_zmz = world.GetTilePointer(this.x, this.y, this.z, bx, by - 1, bz)
                    let block_mmz = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by - 1, bz)
                    let block_mmm = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)
                    let block_zmm = world.GetTilePointer(this.x, this.y, this.z, bx, by - 1, bz - 1)

                    if (block_zzz === null || TileClosed[block_zzz.type]) {
                        this.DetermineLight(block_mzz, color)
                        this.DetermineLight(block_zmz, color)
                        this.DetermineLight(block_zzm, color)
                    }
                    if (block_mzz === null || TileClosed[block_mzz.type]) {
                        this.DetermineLight(block_zzz, color)
                        this.DetermineLight(block_zmz, color)
                        this.DetermineLight(block_zzm, color)
                    }
                    if (block_mzm === null || TileClosed[block_mzm.type]) {
                        this.DetermineLight(block_mzz, color)
                        this.DetermineLight(block_zzm, color)
                        this.DetermineLight(block_mmm, color)
                    }
                    if (block_zzm === null || TileClosed[block_zzm.type]) {
                        this.DetermineLight(block_zzz, color)
                        this.DetermineLight(block_mzm, color)
                        this.DetermineLight(block_zmm, color)
                    }
                    if (block_zmz === null || TileClosed[block_zmz.type]) {
                        this.DetermineLight(block_zzz, color)
                        this.DetermineLight(block_mmz, color)
                        this.DetermineLight(block_zmm, color)
                    }
                    if (block_mmz === null || TileClosed[block_mmz.type]) {
                        this.DetermineLight(block_mzz, color)
                        this.DetermineLight(block_mmm, color)
                        this.DetermineLight(block_zmz, color)
                    }
                    if (block_mmm === null || TileClosed[block_mmm.type]) {
                        this.DetermineLight(block_mzm, color)
                        this.DetermineLight(block_zmm, color)
                        this.DetermineLight(block_mmz, color)
                    }
                    if (block_zmm === null || TileClosed[block_zmm.type]) {
                        this.DetermineLight(block_zzm, color)
                        this.DetermineLight(block_zmz, color)
                        this.DetermineLight(block_mmm, color)
                    }

                    let index = bx + by * BLOCK_COLOR_DIM + bz * BLOCK_COLOR_SLICE
                    if (color[3] > 0) {
                        BLOCK_MESH_COLOR[index][0] = color[0] / color[3]
                        BLOCK_MESH_COLOR[index][1] = color[1] / color[3]
                        BLOCK_MESH_COLOR[index][2] = color[2] / color[3]
                    } else {
                        BLOCK_MESH_COLOR[index][0] = 255
                        BLOCK_MESH_COLOR[index][1] = 255
                        BLOCK_MESH_COLOR[index][2] = 255
                    }
                }
            }
        }
    }
    DetermineLight(tile, color) {
        if (tile === null)
            return
        if (!TileClosed[tile.type]) {
            color[0] += tile.red
            color[1] += tile.green
            color[2] += tile.blue
            color[3]++
        }
    }
    LightOfSide(xs, ys, zs, side) {
        switch (side) {
            case WorldPositiveX:
                return [
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            case WorldNegativeX:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
            case WorldPositiveY:
                return [
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
            case WorldNegativeY:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            case WorldPositiveZ:
                return [
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            default:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
        }
    }
    BuildMesh(world) {
        this.AmbientMesh(world)
        this.ColorMesh(world)
        BLOCK_MESH.Zero()
        for (let side = 0; side < 6; side++) {
            let mesh_begin_index = BLOCK_MESH.index_pos
            let ptr_x = SLICE_X[side]
            let ptr_y = SLICE_Y[side]
            let ptr_z = SLICE_Z[side]
            let toward = SLICE_TOWARDS[side]
            for (SLICE[2] = 0; SLICE[2] < BlockSize; SLICE[2]++) {
                for (SLICE[1] = 0; SLICE[1] < BlockSize; SLICE[1]++) {
                    for (SLICE[0] = 0; SLICE[0] < BlockSize; SLICE[0]++) {
                        let type = this.GetTileTypeUnsafe(SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z])
                        if (type === TILE_NONE)
                            continue
                        SLICE_TEMP[0] = SLICE[0]
                        SLICE_TEMP[1] = SLICE[1]
                        SLICE_TEMP[2] = SLICE[2] + toward
                        if (TileClosed[world.GetTileType(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z])])
                            continue
                        let xs = SLICE[ptr_x]
                        let ys = SLICE[ptr_y]
                        let zs = SLICE[ptr_z]
                        let index = xs + ys * BlockSize + zs * BLOCK_SLICE

                        let texture = TileTexture[type]
                        let bx = xs + BlockSize * this.x
                        let by = ys + BlockSize * this.y
                        let bz = zs + BlockSize * this.z

                        let light = this.LightOfSide(xs, ys, zs, side)
                        let ambient = BLOCK_MESH_AMBIENT[index][side]

                        let rgb_a = Light.Colorize(light[0], ambient[0])
                        let rgb_b = Light.Colorize(light[1], ambient[1])
                        let rgb_c = Light.Colorize(light[2], ambient[2])
                        let rgb_d = Light.Colorize(light[3], ambient[3])

                        RenderTile.Side(BLOCK_MESH, side, bx, by, bz, texture, rgb_a, rgb_b, rgb_c, rgb_d)
                    }
                }
            }
            this.begin_side[side] = mesh_begin_index * 4
            this.count_side[side] = BLOCK_MESH.index_pos - mesh_begin_index
        }
        this.mesh = RenderBuffer.InitCopy(world.gl, BLOCK_MESH)
    }
    RenderThings(interpolation, spriteSet, spriteBuffer, camX, camZ, camAngle) {
        for (let i = 0; i < this.thingCount; i++) {
            let thing = this.things[i]
            if (spriteSet.has(thing)) continue
            spriteSet.add(thing)
            thing.Render(interpolation, spriteBuffer, camX, camZ, camAngle)
        }
        for (let i = 0; i < this.itemCount; i++) {
            let item = this.items[i]
            if (spriteSet.has(item)) continue
            spriteSet.add(item)
            item.Render(spriteBuffer, camX, camZ, camAngle)
        }
        for (let i = 0; i < this.missileCount; i++) {
            let missile = this.missiles[i]
            if (spriteSet.has(missile)) continue
            spriteSet.add(missile)
            missile.Render(spriteBuffer, camX, camZ, camAngle)
        }
        for (let i = 0; i < this.particleCount; i++) {
            let particle = this.particles[i]
            if (spriteSet.has(particle)) continue
            spriteSet.add(particle)
            particle.Render(spriteBuffer, camX, camZ)
        }
    }
}
