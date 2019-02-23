const CHUNK_DIM = 8
const CHUNK_SLICE = CHUNK_DIM * CHUNK_DIM
const CHUNK_ALL = CHUNK_SLICE * CHUNK_DIM
const CHUNK_MESH = new RenderCopy(3, 3, 2, CHUNK_ALL * 6 * 4, CHUNK_ALL * 6 * 6)
const CHUNK_MESH_AMBIENT = new Array(CHUNK_ALL)
for (let i = 0; i < CHUNK_ALL; i++) {
    CHUNK_MESH_AMBIENT[i] = new Array(6)
    for (let j = 0; j < 6; j++) {
        CHUNK_MESH_AMBIENT[i][j] = new Uint8Array(4)
    }
}
const CHUNK_COLOR_DIM = CHUNK_DIM + 1
const CHUNK_COLOR_SLICE = CHUNK_COLOR_DIM * CHUNK_COLOR_DIM
const CHUNK_MESH_COLOR = new Array(CHUNK_COLOR_DIM * CHUNK_COLOR_SLICE)
for (let i = 0; i < CHUNK_MESH_COLOR.length; i++) {
    CHUNK_MESH_COLOR[i] = new Uint8Array(3)
}
const SLICE_X = [2, 1, 0, 2, 1, 0]
const SLICE_Y = [0, 2, 1, 0, 2, 1]
const SLICE_Z = [1, 0, 2, 1, 0, 2]
const SLICE_TOWARDS = [1, 1, 1, -1, -1, -1]
const SLICE = new Array(3)
const SLICE_TEMP = new Array(3)

class Block {
    constructor(px, py, pz) {
        this.tiles = []
        this.terrain_offset = []
        this.visibility = 0
        this.mesh
        this.begin_side = new Array(6)
        this.count_side = new Array(6)
        this.x
        this.y
        this.z
        this.units = []
        this.unit_count = 0
        this.physical = []
        this.physical_count = 0
        this.lights = []

        this.x = px
        this.y = py
        this.z = pz

        for (let t = 0; t < CHUNK_ALL; t++)
            this.tiles[t] = new Tile()

        this.lights.push(new Light(CHUNK_DIM - 1, CHUNK_DIM - 1, CHUNK_DIM - 1, Render.PackRgb(255, 230, 200)))
    }
    save() {
        let data = `{"x":${this.x},"y":${this.y},"z":${this.z},"tiles":[` + this.tiles[0].type
        for (let i = 1; i < CHUNK_ALL; i++) {
            data += ","
            data += this.tiles[i].type
        }
        data += `],"things":[`
        if (this.thing_count > 0) {
            let x = this.x * GRID_SIZE
            let y = this.y * GRID_SIZE
            let z = this.z * GRID_SIZE
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
        for (let i = 0; i < CHUNK_ALL; i++) {
            if (this.tiles[i].type !== BLOCK_NONE)
                return false
        }
        return true
    }
    get_tile_pointer_unsafe(x, y, z) {
        return this.tiles[x + y * CHUNK_DIM + z * CHUNK_SLICE]
    }
    get_tile_type_unsafe(x, y, z) {
        return this.tiles[x + y * CHUNK_DIM + z * CHUNK_SLICE].type
    }
    add_unit(u) {
        if (this.unit_count === this.units.length) {
            let cp = new Array(this.unit_count + 5)
            for (let i = 0; i < this.unit_count; i++) {
                cp[i] = this.units[i]
            }
            this.units = cp
        }
        this.units[this.unit_count] = u
        this.unit_count++
    }
    remove_unit(u) {
        for (let i = 0; i < this.unit_count; i++) {
            if (this.units[i] === u) {
                for (let j = i; j < this.unit_count - 1; j++) {
                    this.units[j] = this.units[j + 1]
                }
                this.unit_count--
                break
            }
        }
    }
    add_physical(world, p) {
        if (this.physical_count === this.physical.length) {
            let cp = new Array(this.physical_count + 5)
            for (let i = 0; i < this.physical_count; i++) {
                cp[i] = this.physical[i]
            }
            this.physical = cp
        }
        this.physical[this.physical_count] = p
        this.physical_count++

        if (this.physical_count === 2) {
            world.add_block_cache(this)
        }
    }
    remove_physical(world, p) {
        for (let i = 0; i < this.physical_count; i++) {
            if (this.physical[i] === p) {
                for (let j = i; j < this.physical_count - 1; j++)
                    this.physical[j] = this.physical[j + 1]
                this.physical_count--
                if (this.physical_count === 1)
                    world.remove_block_cache(this)
                break
            }
        }
    }
    ambient_mesh(world) {
        for (let bz = 0; bz < CHUNK_DIM; bz++) {
            for (let by = 0; by < CHUNK_DIM; by++) {
                for (let bx = 0; bx < CHUNK_DIM; bx++) {
                    let index = bx + by * CHUNK_DIM + bz * CHUNK_SLICE
                    if (this.tiles[index].type === BLOCK_NONE)
                        continue

                    let ao_mmz = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by - 1, bz))
                    let ao_mmm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by - 1, bz - 1))
                    let ao_mmp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by - 1, bz + 1))
                    let ao_mzp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by, bz + 1))
                    let ao_mzm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by, bz - 1))
                    let ao_mpz = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by + 1, bz))
                    let ao_mpp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by + 1, bz + 1))
                    let ao_mpm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx - 1, by + 1, bz - 1))
                    let ao_zpp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx, by + 1, bz + 1))
                    let ao_zmp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx, by - 1, bz + 1))
                    let ao_zpm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx, by + 1, bz - 1))
                    let ao_zmm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx, by - 1, bz - 1))
                    let ao_ppz = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by + 1, bz))
                    let ao_pmz = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by - 1, bz))
                    let ao_pzp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by, bz + 1))
                    let ao_pzm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by, bz - 1))
                    let ao_pmm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by - 1, bz - 1))
                    let ao_ppm = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by + 1, bz - 1))
                    let ao_ppp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by + 1, bz + 1))
                    let ao_pmp = Tile.Closed(world.get_tile_type(this.x, this.y, this.z, bx + 1, by - 1, bz + 1))

                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][0] = Tile.Ambient(ao_pmz, ao_pzm, ao_pmm)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][1] = Tile.Ambient(ao_ppz, ao_pzm, ao_ppm)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][2] = Tile.Ambient(ao_ppz, ao_pzp, ao_ppp)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_X][3] = Tile.Ambient(ao_pmz, ao_pzp, ao_pmp)

                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][0] = Tile.Ambient(ao_mmz, ao_mzm, ao_mmm)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][1] = Tile.Ambient(ao_mmz, ao_mzp, ao_mmp)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][2] = Tile.Ambient(ao_mpz, ao_mzp, ao_mpp)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_X][3] = Tile.Ambient(ao_mpz, ao_mzm, ao_mpm)

                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][0] = Tile.Ambient(ao_mpz, ao_zpm, ao_mpm)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][1] = Tile.Ambient(ao_mpz, ao_zpp, ao_mpp)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][2] = Tile.Ambient(ao_ppz, ao_zpp, ao_ppp)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Y][3] = Tile.Ambient(ao_ppz, ao_zpm, ao_ppm)

                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][0] = Tile.Ambient(ao_mmz, ao_zmm, ao_mmm)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][1] = Tile.Ambient(ao_pmz, ao_zmm, ao_pmm)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][2] = Tile.Ambient(ao_pmz, ao_zmp, ao_pmp)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Y][3] = Tile.Ambient(ao_mmz, ao_zmp, ao_mmp)

                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][0] = Tile.Ambient(ao_pzp, ao_zmp, ao_pmp)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][1] = Tile.Ambient(ao_pzp, ao_zpp, ao_ppp)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][2] = Tile.Ambient(ao_mzp, ao_zpp, ao_mpp)
                    CHUNK_MESH_AMBIENT[index][WORLD_POSITIVE_Z][3] = Tile.Ambient(ao_mzp, ao_zmp, ao_mmp)

                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][0] = Tile.Ambient(ao_mzm, ao_zmm, ao_mmm)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][1] = Tile.Ambient(ao_mzm, ao_zpm, ao_mpm)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][2] = Tile.Ambient(ao_pzm, ao_zpm, ao_ppm)
                    CHUNK_MESH_AMBIENT[index][WORLD_NEGATIVE_Z][3] = Tile.Ambient(ao_pzm, ao_zmm, ao_pmm)
                }
            }
        }
    }
    color_mesh(world) {
        for (let bz = 0; bz < CHUNK_COLOR_DIM; bz++) {
            for (let by = 0; by < CHUNK_COLOR_DIM; by++) {
                for (let bx = 0; bx < CHUNK_COLOR_DIM; bx++) {
                    let color = [0, 0, 0, 0]

                    let block_zzz = world.get_tile_pointer(this.x, this.y, this.z, bx, by, bz)
                    let block_mzz = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by, bz)
                    let block_mzm = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by, bz - 1)
                    let block_zzm = world.get_tile_pointer(this.x, this.y, this.z, bx, by, bz - 1)
                    let block_zmz = world.get_tile_pointer(this.x, this.y, this.z, bx, by - 1, bz)
                    let block_mmz = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by - 1, bz)
                    let block_mmm = world.get_tile_pointer(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)
                    let block_zmm = world.get_tile_pointer(this.x, this.y, this.z, bx, by - 1, bz - 1)

                    if (Tile.PointerClosed(block_zzz)) {
                        this.determine_light(block_mzz, color)
                        this.determine_light(block_zmz, color)
                        this.determine_light(block_zzm, color)
                    }
                    if (Tile.PointerClosed(block_mzz)) {
                        this.determine_light(block_zzz, color)
                        this.determine_light(block_zmz, color)
                        this.determine_light(block_zzm, color)
                    }
                    if (Tile.PointerClosed(block_mzm)) {
                        this.determine_light(block_mzz, color)
                        this.determine_light(block_zzm, color)
                        this.determine_light(block_mmm, color)
                    }
                    if (Tile.PointerClosed(block_zzm)) {
                        this.determine_light(block_zzz, color)
                        this.determine_light(block_mzm, color)
                        this.determine_light(block_zmm, color)
                    }
                    if (Tile.PointerClosed(block_zmz)) {
                        this.determine_light(block_zzz, color)
                        this.determine_light(block_mmz, color)
                        this.determine_light(block_zmm, color)
                    }
                    if (Tile.PointerClosed(block_mmz)) {
                        this.determine_light(block_mzz, color)
                        this.determine_light(block_mmm, color)
                        this.determine_light(block_zmz, color)
                    }
                    if (Tile.PointerClosed(block_mmm)) {
                        this.determine_light(block_mzm, color)
                        this.determine_light(block_zmm, color)
                        this.determine_light(block_mmz, color)
                    }
                    if (Tile.PointerClosed(block_zmm)) {
                        this.determine_light(block_zzm, color)
                        this.determine_light(block_zmz, color)
                        this.determine_light(block_mmm, color)
                    }

                    let index = bx + by * CHUNK_COLOR_DIM + bz * CHUNK_COLOR_SLICE
                    if (color[3] > 0) {
                        CHUNK_MESH_COLOR[index][0] = color[0] / color[3]
                        CHUNK_MESH_COLOR[index][1] = color[1] / color[3]
                        CHUNK_MESH_COLOR[index][2] = color[2] / color[3]
                    } else {
                        CHUNK_MESH_COLOR[index][0] = 255
                        CHUNK_MESH_COLOR[index][1] = 255
                        CHUNK_MESH_COLOR[index][2] = 255
                    }
                }
            }
        }
    }
    determine_light(tile, color) {
        if (tile === null) {
            return
        }
        if (!Tile.Closed(tile.type)) {
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
                    CHUNK_MESH_COLOR[xs + 1 + ys * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + (ys + 1) * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + (ys + 1) * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + ys * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE]
                ]
            case WORLD_NEGATIVE_X:
                return [
                    CHUNK_MESH_COLOR[xs + ys * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + ys * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + (ys + 1) * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + (ys + 1) * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE]
                ]
            case WORLD_POSITIVE_Y:
                return [
                    CHUNK_MESH_COLOR[xs + (ys + 1) * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + (ys + 1) * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + (ys + 1) * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + (ys + 1) * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE]
                ]
            case WORLD_NEGATIVE_Y:
                return [
                    CHUNK_MESH_COLOR[xs + ys * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + ys * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + ys * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + ys * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE]
                ]
            case WORLD_POSITIVE_Z:
                return [
                    CHUNK_MESH_COLOR[xs + 1 + ys * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + (ys + 1) * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + (ys + 1) * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + ys * CHUNK_COLOR_DIM + (zs + 1) * CHUNK_COLOR_SLICE]
                ]
            default:
                return [
                    CHUNK_MESH_COLOR[xs + ys * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + (ys + 1) * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + (ys + 1) * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE],
                    CHUNK_MESH_COLOR[xs + 1 + ys * CHUNK_COLOR_DIM + zs * CHUNK_COLOR_SLICE]
                ]
        }
    }
    build_mesh(world, g, gl) {
        this.ambient_mesh(world)
        this.color_mesh(world)
        CHUNK_MESH.zero()
        for (let side = 0; side < 6; side++) {
            let mesh_begin_index = CHUNK_MESH.index_pos
            let ptr_x = SLICE_X[side]
            let ptr_y = SLICE_Y[side]
            let ptr_z = SLICE_Z[side]
            let toward = SLICE_TOWARDS[side]
            for (SLICE[2] = 0; SLICE[2] < CHUNK_DIM; SLICE[2]++) {
                for (SLICE[1] = 0; SLICE[1] < CHUNK_DIM; SLICE[1]++) {
                    for (SLICE[0] = 0; SLICE[0] < CHUNK_DIM; SLICE[0]++) {
                        let type = this.get_tile_type_unsafe(SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z])
                        if (type === BLOCK_NONE)
                            continue
                        SLICE_TEMP[0] = SLICE[0]
                        SLICE_TEMP[1] = SLICE[1]
                        SLICE_TEMP[2] = SLICE[2] + toward
                        if (Tile.Closed(world.get_tile_type(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z])))
                            continue
                        let xs = SLICE[ptr_x]
                        let ys = SLICE[ptr_y]
                        let zs = SLICE[ptr_z]
                        let index = xs + ys * CHUNK_DIM + zs * CHUNK_SLICE

                        let texture = Tile.Texture(type)
                        let bx = xs + CHUNK_DIM * this.x
                        let by = ys + CHUNK_DIM * this.y
                        let bz = zs + CHUNK_DIM * this.z

                        let light = this.light_of_side(xs, ys, zs, side)
                        let ambient = CHUNK_MESH_AMBIENT[index][side]

                        let rgb_a = Light.Colorize(light[0], ambient[0])
                        let rgb_b = Light.Colorize(light[1], ambient[1])
                        let rgb_c = Light.Colorize(light[2], ambient[2])
                        let rgb_d = Light.Colorize(light[3], ambient[3])

                        RenderTile.Side(CHUNK_MESH, side, bx, by, bz, texture, rgb_a, rgb_b, rgb_c, rgb_d)
                    }
                }
            }
            this.begin_side[side] = mesh_begin_index * 4
            this.count_side[side] = CHUNK_MESH.index_pos - mesh_begin_index
        }
        this.mesh = RenderBuffer.InitCopy(gl, CHUNK_MESH)
    }
    render_things(gl, sprite_buffers, mv) {
        for (let i = 0; i < this.unit_count; i++) {
            let u = this.units[i]
            let s = u.animation[u.animation_frame][u.direction]
            if (u.mirror) {
                Render.MirrorSprite(sprite_buffers[u.sprite_id], u.x, u.y + s.height, u.z, mv, s)
            } else {
                Render.Sprite(sprite_buffers[u.sprite_id], u.x, u.y + s.height, u.z, mv, s)
            }
        }
    }
}
