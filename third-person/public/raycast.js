class Cast {
    static Chunk(chunk, from_x, from_y, from_z, to_x, to_y, to_z) {
        let x = Math.floor(from_x)
        let y = Math.floor(from_y)
        let z = Math.floor(from_z)
        let dt_dx, dt_dy, dt_dz;
        let inc_x, inc_y, inc_z;
        let next_x, next_y, next_z;
        let dx = to_x - from_x
        if (dx === 0) {
            inc_x = 0
            next_x = Number.MAX_VALUE
        } else if (dx > 0) {
            inc_x = 1
            dt_dx = 1.0 / dx
            next_x = (x + 1.0 - from_x) * dt_dx
        } else {
            inc_x = -1
            dt_dx = 1.0 / -dx
            next_x = (from_x - x) * dt_dx
        }
        let dy = to_y - from_y
        if (dy === 0) {
            inc_y = 0
            next_y = Number.MAX_VALUE
        } else if (dy > 0) {
            inc_y = 1
            dt_dy = 1.0 / dy
            next_y = (y + 1 - from_y) * dt_dy
        } else {
            inc_y = -1
            dt_dy = 1.0 / -dy
            next_y = (from_y - y) * dt_dy
        }
        let dz = to_z - from_z
        if (dz === 0) {
            inc_z = 0
            next_z = Number.MAX_VALUE
        } else if (dz > 0) {
            inc_z = 1
            dt_dz = 1.0 / dz
            next_z = (z + 1.0 - from_z) * dt_dz
        } else {
            inc_z = -1
            dt_dz = 1.0 / -dz
            next_z = (from_z - z) * dt_dz
        }
        while (true) {
            if (Block.Closed(chunk.get_block_type_unsafe(x, y, z))) {
                return false
            } else if (x === Math.floor(to_x) && y === Math.floor(to_y) && z === Math.floor(to_z)) {
                return true
            }
            if (next_x < next_y) {
                if (next_x < next_z) {
                    x += inc_x
                    if (x < 0 || x >= CHUNK_DIM) {
                        return false
                    }
                    next_x += dt_dx
                } else {
                    z += inc_z
                    if (z < 0 || z >= CHUNK_DIM) {
                        return false
                    }
                    next_z += dt_dz
                }
            } else {
                if (next_y < next_z) {
                    y += inc_y
                    if (y < 0 || y >= CHUNK_DIM) {
                        return false
                    }
                    next_y += dt_dy
                } else {
                    z += inc_z
                    if (z < 0 || z >= CHUNK_DIM) {
                        return false
                    }
                    next_z += dt_dz
                }
            }
        }
    }
    static World(world, from_x, from_y, from_z, to_x, to_y, to_z) {
        let x = Math.floor(from_x)
        let y = Math.floor(from_y)
        let z = Math.floor(from_z)
        let dt_dx, dt_dy, dt_dz;
        let inc_x, inc_y, inc_z;
        let next_x, next_y, next_z;
        let dx = to_x - from_x
        if (dx === 0) {
            inc_x = 0
            next_x = Number.MAX_VALUE
        } else if (dx > 0) {
            inc_x = 1
            dt_dx = 1.0 / dx
            next_x = (x + 1.0 - from_x) * dt_dx
        } else {
            inc_x = -1
            dt_dx = 1.0 / -dx
            next_x = (from_x - x) * dt_dx
        }
        let dy = to_y - from_y
        if (dy === 0) {
            inc_y = 0
            next_y = Number.MAX_VALUE
        } else if (dy > 0) {
            inc_y = 1
            dt_dy = 1.0 / dy
            next_y = (y + 1 - from_y) * dt_dy
        } else {
            inc_y = -1
            dt_dy = 1.0 / -dy
            next_y = (from_y - y) * dt_dy
        }
        let dz = to_z - from_z
        if (dz === 0) {
            inc_z = 0
            next_z = Number.MAX_VALUE
        } else if (dz > 0) {
            inc_z = 1
            dt_dz = 1.0 / dz
            next_z = (z + 1.0 - from_z) * dt_dz
        } else {
            inc_z = -1
            dt_dz = 1.0 / -dz
            next_z = (from_z - z) * dt_dz
        }
        while (true) {
            console.log(`${x} ${y} ${z}`)
            if (x === Math.floor(to_x) && y === Math.floor(to_y) && z === Math.floor(to_z)) {
                return [to_x, to_y, to_z]
            }
            if (next_x < next_y) {
                if (next_x < next_z) {
                    x += inc_x
                    if (x < 0 || x >= world.chunks_w) {
                        return [x + 0.5, y + 0.5, z + 0.5, inc_x < 0 ? WORLD_POSITIVE_X : WORLD_NEGATIVE_X]
                    }
                    let cx = Math.floor(x / CHUNK_DIM)
                    let cy = Math.floor(y / CHUNK_DIM)
                    let cz = Math.floor(z / CHUNK_DIM)
                    let bx = x % CHUNK_DIM
                    let by = y % CHUNK_DIM
                    let bz = z % CHUNK_DIM
                    if (Block.Closed(world.get_block_type(cx, cy, cz, bx, by, bz))) {
                        x -= inc_x
                        return [x, y, z, inc_x < 0 ? WORLD_POSITIVE_X : WORLD_NEGATIVE_X]
                    }
                    next_x += dt_dx
                } else {
                    z += inc_z
                    if (z < 0 || z >= world.chunks_l) {
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    let cx = Math.floor(x / CHUNK_DIM)
                    let cy = Math.floor(y / CHUNK_DIM)
                    let cz = Math.floor(z / CHUNK_DIM)
                    let bx = x % CHUNK_DIM
                    let by = y % CHUNK_DIM
                    let bz = z % CHUNK_DIM
                    if (Block.Closed(world.get_block_type(cx, cy, cz, bx, by, bz))) {
                        z -= inc_z
                        return [x, y, z, inc_x < 0 ? WORLD_POSITIVE_X : WORLD_NEGATIVE_X]
                    }
                    next_z += dt_dz
                }
            } else {
                if (next_y < next_z) {
                    y += inc_y
                    if (y < 0 || y >= world.chunks_h) {
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    let cx = Math.floor(x / CHUNK_DIM)
                    let cy = Math.floor(y / CHUNK_DIM)
                    let cz = Math.floor(z / CHUNK_DIM)
                    let bx = x % CHUNK_DIM
                    let by = y % CHUNK_DIM
                    let bz = z % CHUNK_DIM
                    if (Block.Closed(world.get_block_type(cx, cy, cz, bx, by, bz))) {
                        y -= inc_y
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    next_y += dt_dy
                } else {
                    z += inc_z
                    if (z < 0 || z >= world.chunks_l) {
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    let cx = Math.floor(x / CHUNK_DIM)
                    let cy = Math.floor(y / CHUNK_DIM)
                    let cz = Math.floor(z / CHUNK_DIM)
                    let bx = x % CHUNK_DIM
                    let by = y % CHUNK_DIM
                    let bz = z % CHUNK_DIM
                    if (Block.Closed(world.get_block_type(cx, cy, cz, bx, by, bz))) {
                        z -= inc_z
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    next_z += dt_dz
                }
            }
        }
    }
}