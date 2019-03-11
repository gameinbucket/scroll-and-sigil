const BLOCK_SIZE = 8
const INV_BLOCK_SIZE = 1.0 / BLOCK_SIZE
const BLOCK_SLICE = BLOCK_SIZE * BLOCK_SIZE
const BLOCK_ALL = BLOCK_SLICE * BLOCK_SIZE
const BLOCK_MESH = new RenderCopy(3, 3, 2, BLOCK_ALL * 6 * 4, BLOCK_ALL * 6 * 6)
const BLOCK_MESH_AMBIENT = new Array(BLOCK_ALL)
for (let i = 0; i < BLOCK_ALL; i++) {
    BLOCK_MESH_AMBIENT[i] = new Array(6)
    for (let j = 0; j < 6; j++) {
        BLOCK_MESH_AMBIENT[i][j] = new Uint8Array(4)
    }
}
const BLOCK_COLOR_DIM = BLOCK_SIZE + 1
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
        this.things = []
        this.thing_count = 0

        this.tiles = []
        for (let t = 0; t < BLOCK_ALL; t++)
            this.tiles[t] = new Tile()

        this.lights = []
        this.lights.push(new Light(BLOCK_SIZE - 1, BLOCK_SIZE - 1, BLOCK_SIZE - 1, Render.PackRgb(255, 230, 200)))
    }
    save() {
        let data = "{x:" + this.x + ",y:" + this.y + ",z:" + this.z + ",t["
        data += this.tiles[0].type
        for (let i = 1; i < BLOCK_ALL; i++) {
            data += ","
            data += this.tiles[i].type
        }
        data += "],e["
        if (this.thing_count > 0) {
            let x = this.x * BLOCK_SIZE
            let y = this.y * BLOCK_SIZE
            let z = this.z * BLOCK_SIZE
            data += this.things[0].save(x, y, z)
            for (let i = 1; i < this.thing_count; i++) {
                data += ","
                data += this.things[i].save(x, y, z)
            }
        }
        data += "]}"
        return data
    }
    empty() {
        if (this.thing_count > 0)
            return false
        for (let i = 0; i < BLOCK_ALL; i++)
            if (this.tiles[i].type !== TILE_NONE)
                return false
        return true
    }
    get_tile_pointer_unsafe(x, y, z) {
        return this.tiles[x + y * BLOCK_SIZE + z * BLOCK_SLICE]
    }
    get_tile_type_unsafe(x, y, z) {
        return this.tiles[x + y * BLOCK_SIZE + z * BLOCK_SLICE].type
    }
    add_thing(thing) {
        this.things[this.thing_count] = thing
        this.thing_count++
    }
    remove_thing(thing) {
        for (let i = 0; i < this.thing_count; i++) {
            if (this.things[i] === thing) {
                for (let j = i; j < this.thing_count - 1; j++)
                    this.things[j] = this.things[j + 1]
                this.thing_count--
                return
            }
        }
    }
    ambient_mesh(world) {
        for (let bz = 0; bz < BLOCK_SIZE; bz++) {
            for (let by = 0; by < BLOCK_SIZE; by++) {
                for (let bx = 0; bx < BLOCK_SIZE; bx++) {
                    let index = bx + by * BLOCK_SIZE + bz * BLOCK_SLICE
                    if (this.tiles[index].type === TILE_NONE)
                        continue

                    let ao_mmz = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by - 1, bz)]
                    let ao_mmm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)]
                    let ao_mmp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by - 1, bz + 1)]
                    let ao_mzp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by, bz + 1)]
                    let ao_mzm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by, bz - 1)]
                    let ao_mpz = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by + 1, bz)]
                    let ao_mpp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by + 1, bz + 1)]
                    let ao_mpm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx - 1, by + 1, bz - 1)]
                    let ao_zpp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx, by + 1, bz + 1)]
                    let ao_zmp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx, by - 1, bz + 1)]
                    let ao_zpm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx, by + 1, bz - 1)]
                    let ao_zmm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx, by - 1, bz - 1)]
                    let ao_ppz = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by + 1, bz)]
                    let ao_pmz = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by - 1, bz)]
                    let ao_pzp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by, bz + 1)]
                    let ao_pzm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by, bz - 1)]
                    let ao_pmm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by - 1, bz - 1)]
                    let ao_ppm = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by + 1, bz - 1)]
                    let ao_ppp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by + 1, bz + 1)]
                    let ao_pmp = TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, bx + 1, by - 1, bz + 1)]

                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_X][0] = Tile.Ambient(ao_pmz, ao_pzm, ao_pmm)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_X][1] = Tile.Ambient(ao_ppz, ao_pzm, ao_ppm)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_X][2] = Tile.Ambient(ao_ppz, ao_pzp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_X][3] = Tile.Ambient(ao_pmz, ao_pzp, ao_pmp)

                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][0] = Tile.Ambient(ao_mmz, ao_mzm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][1] = Tile.Ambient(ao_mmz, ao_mzp, ao_mmp)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][2] = Tile.Ambient(ao_mpz, ao_mzp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][3] = Tile.Ambient(ao_mpz, ao_mzm, ao_mpm)

                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][0] = Tile.Ambient(ao_mpz, ao_zpm, ao_mpm)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][1] = Tile.Ambient(ao_mpz, ao_zpp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][2] = Tile.Ambient(ao_ppz, ao_zpp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][3] = Tile.Ambient(ao_ppz, ao_zpm, ao_ppm)

                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][0] = Tile.Ambient(ao_mmz, ao_zmm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][1] = Tile.Ambient(ao_pmz, ao_zmm, ao_pmm)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][2] = Tile.Ambient(ao_pmz, ao_zmp, ao_pmp)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][3] = Tile.Ambient(ao_mmz, ao_zmp, ao_mmp)

                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][0] = Tile.Ambient(ao_pzp, ao_zmp, ao_pmp)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][1] = Tile.Ambient(ao_pzp, ao_zpp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][2] = Tile.Ambient(ao_mzp, ao_zpp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][3] = Tile.Ambient(ao_mzp, ao_zmp, ao_mmp)

                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][0] = Tile.Ambient(ao_mzm, ao_zmm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][1] = Tile.Ambient(ao_mzm, ao_zpm, ao_mpm)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][2] = Tile.Ambient(ao_pzm, ao_zpm, ao_ppm)
                    BLOCK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][3] = Tile.Ambient(ao_pzm, ao_zmm, ao_pmm)
                }
            }
        }
    }
    color_mesh(world) {
        for (let bz = 0; bz < BLOCK_COLOR_DIM; bz++) {
            for (let by = 0; by < BLOCK_COLOR_DIM; by++) {
                for (let bx = 0; bx < BLOCK_COLOR_DIM; bx++) {
                    let color = [0, 0, 0, 0]

                    let block_zzz = world.get_tile_pointer(this.x, this.y, this.z, bx, by, bz)
                    let block_mzz = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by, bz)
                    let block_mzm = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by, bz - 1)
                    let block_zzm = world.get_tile_pointer(this.x, this.y, this.z, bx, by, bz - 1)
                    let block_zmz = world.get_tile_pointer(this.x, this.y, this.z, bx, by - 1, bz)
                    let block_mmz = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by - 1, bz)
                    let block_mmm = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)
                    let block_zmm = world.get_tile_pointer(this.x, this.y, this.z, bx, by - 1, bz - 1)

                    if (block_zzz === null || TILE_CLOSED[block_zzz.type]) {
                        this.determine_light(block_mzz, color)
                        this.determine_light(block_zmz, color)
                        this.determine_light(block_zzm, color)
                    }
                    if (block_mzz === null || TILE_CLOSED[block_mzz.type]) {
                        this.determine_light(block_zzz, color)
                        this.determine_light(block_zmz, color)
                        this.determine_light(block_zzm, color)
                    }
                    if (block_mzm === null || TILE_CLOSED[block_mzm.type]) {
                        this.determine_light(block_mzz, color)
                        this.determine_light(block_zzm, color)
                        this.determine_light(block_mmm, color)
                    }
                    if (block_zzm === null || TILE_CLOSED[block_zzm.type]) {
                        this.determine_light(block_zzz, color)
                        this.determine_light(block_mzm, color)
                        this.determine_light(block_zmm, color)
                    }
                    if (block_zmz === null || TILE_CLOSED[block_zmz.type]) {
                        this.determine_light(block_zzz, color)
                        this.determine_light(block_mmz, color)
                        this.determine_light(block_zmm, color)
                    }
                    if (block_mmz === null || TILE_CLOSED[block_mmz.type]) {
                        this.determine_light(block_mzz, color)
                        this.determine_light(block_mmm, color)
                        this.determine_light(block_zmz, color)
                    }
                    if (block_mmm === null || TILE_CLOSED[block_mmm.type]) {
                        this.determine_light(block_mzm, color)
                        this.determine_light(block_zmm, color)
                        this.determine_light(block_mmz, color)
                    }
                    if (block_zmm === null || TILE_CLOSED[block_zmm.type]) {
                        this.determine_light(block_zzm, color)
                        this.determine_light(block_zmz, color)
                        this.determine_light(block_mmm, color)
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
    determine_light(tile, color) {
        if (tile === null)
            return
        if (!TILE_CLOSED[tile.type]) {
            color[0] += tile.red
            color[1] += tile.green
            color[2] += tile.blue
            color[3]++
        }
    }
    light_of_side(xs, ys, zs, side) {
        switch (side) {
            case WORLD_POSITIVE_X:
                return [
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            case WORLD_NEGATIVE_X:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
            case WORLD_POSITIVE_Y:
                return [
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
            case WORLD_NEGATIVE_Y:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            case WORLD_POSITIVE_Z:
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
    build_mesh(world) {
        this.ambient_mesh(world)
        this.color_mesh(world)
        BLOCK_MESH.zero()
        for (let side = 0; side < 6; side++) {
            let mesh_begin_index = BLOCK_MESH.index_pos
            let ptr_x = SLICE_X[side]
            let ptr_y = SLICE_Y[side]
            let ptr_z = SLICE_Z[side]
            let toward = SLICE_TOWARDS[side]
            for (SLICE[2] = 0; SLICE[2] < BLOCK_SIZE; SLICE[2]++) {
                for (SLICE[1] = 0; SLICE[1] < BLOCK_SIZE; SLICE[1]++) {
                    for (SLICE[0] = 0; SLICE[0] < BLOCK_SIZE; SLICE[0]++) {
                        let type = this.get_tile_type_unsafe(SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z])
                        if (type === TILE_NONE)
                            continue
                        SLICE_TEMP[0] = SLICE[0]
                        SLICE_TEMP[1] = SLICE[1]
                        SLICE_TEMP[2] = SLICE[2] + toward
                        if (TILE_CLOSED[world.get_tile_type(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z])])
                            continue
                        let xs = SLICE[ptr_x]
                        let ys = SLICE[ptr_y]
                        let zs = SLICE[ptr_z]
                        let index = xs + ys * BLOCK_SIZE + zs * BLOCK_SLICE

                        let texture = TILE_TEXTURE[type]
                        let bx = xs + BLOCK_SIZE * this.x
                        let by = ys + BLOCK_SIZE * this.y
                        let bz = zs + BLOCK_SIZE * this.z

                        let light = this.light_of_side(xs, ys, zs, side)
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
    render_things(interpolation, sprite_set, sprite_buffer, x, y) {
        for (let i = 0; i < this.thing_count; i++) {
            let thing = this.things[i]
            if (sprite_set.has(thing)) continue
            sprite_set.add(thing)
            thing.render(interpolation, sprite_buffer, x, y)
        }
    }
}
