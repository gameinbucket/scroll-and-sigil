let CastX = 0
let CastY = 0
let CastZ = 0
let CastSide = 0
let CastTileType = null

class Cast {
    static Block(block, fromX, fromY, fromZ, toX, toY, toZ) {
        let x = Math.floor(fromX)
        let y = Math.floor(fromY)
        let z = Math.floor(fromZ)
        let deltaX, deltaY, deltaZ
        let incrementX, incrementY, incrementZ
        let nextX, nextY, nextZ
        let dx = toX - fromX
        if (dx === 0) {
            incrementX = 0
            nextX = Number.MAX_VALUE
        } else if (dx > 0) {
            incrementX = 1
            deltaX = 1.0 / dx
            nextX = (x + 1.0 - fromX) * deltaX
        } else {
            incrementX = -1
            deltaX = 1.0 / -dx
            nextX = (fromX - x) * deltaX
        }
        let dy = toY - fromY
        if (dy === 0) {
            incrementY = 0
            nextY = Number.MAX_VALUE
        } else if (dy > 0) {
            incrementY = 1
            deltaY = 1.0 / dy
            nextY = (y + 1 - fromY) * deltaY
        } else {
            incrementY = -1
            deltaY = 1.0 / -dy
            nextY = (fromY - y) * deltaY
        }
        let dz = toZ - fromZ
        if (dz === 0) {
            incrementZ = 0
            nextZ = Number.MAX_VALUE
        } else if (dz > 0) {
            incrementZ = 1
            deltaZ = 1.0 / dz
            nextZ = (z + 1.0 - fromZ) * deltaZ
        } else {
            incrementZ = -1
            deltaZ = 1.0 / -dz
            nextZ = (fromZ - z) * deltaZ
        }
        while (true) {
            if (TileClosed[block.GetTileTypeUnsafe(x, y, z)])
                return false
            else if (x === Math.floor(toX) && y === Math.floor(toY) && z === Math.floor(toZ))
                return true
            if (nextX < nextY) {
                if (nextX < nextZ) {
                    x += incrementX
                    if (x < 0 || x >= BlockSize)
                        return false
                    nextX += deltaX
                } else {
                    z += incrementZ
                    if (z < 0 || z >= BlockSize)
                        return false
                    nextZ += deltaZ
                }
            } else {
                if (nextY < nextZ) {
                    y += incrementY
                    if (y < 0 || y >= BlockSize)
                        return false
                    nextY += deltaY
                } else {
                    z += incrementZ
                    if (z < 0 || z >= BlockSize)
                        return false
                    nextZ += deltaZ
                }
            }
        }
    }
    static World(world, fromX, fromY, fromZ, toX, toY, toZ) {
        let x = Math.floor(fromX)
        let y = Math.floor(fromY)
        let z = Math.floor(fromZ)
        let deltaX, deltaY, deltaZ
        let incrementX, incrementY, incrementZ
        let nextX, nextY, nextZ
        let dx = toX - fromX
        if (dx === 0) {
            incrementX = 0
            nextX = Number.MAX_VALUE
        } else if (dx > 0) {
            incrementX = 1
            deltaX = 1.0 / dx
            nextX = (x + 1.0 - fromX) * deltaX
        } else {
            incrementX = -1
            deltaX = 1.0 / -dx
            nextX = (fromX - x) * deltaX
        }
        let dy = toY - fromY
        if (dy === 0) {
            incrementY = 0
            nextY = Number.MAX_VALUE
        } else if (dy > 0) {
            incrementY = 1
            deltaY = 1.0 / dy
            nextY = (y + 1 - fromY) * deltaY
        } else {
            incrementY = -1
            deltaY = 1.0 / -dy
            nextY = (fromY - y) * deltaY
        }
        let dz = toZ - fromZ
        if (dz === 0) {
            incrementZ = 0
            nextZ = Number.MAX_VALUE
        } else if (dz > 0) {
            incrementZ = 1
            deltaZ = 1.0 / dz
            nextZ = (z + 1.0 - fromZ) * deltaZ
        } else {
            incrementZ = -1
            deltaZ = 1.0 / -dz
            nextZ = (fromZ - z) * deltaZ
        }
        let goalX = Math.floor(toX)
        let goalY = Math.floor(toY)
        let goalZ = Math.floor(toZ)
        while (true) {
            if (x === goalX && y === goalY && z === goalZ) {
                CastTileType = null
                return
            }
            if (nextX < nextY) {
                if (nextX < nextZ) {
                    x += incrementX
                    if (x < 0 || x >= world.tileWidth) {
                        CastTileType = null
                        return
                    }
                    let bx = Math.floor(x * InverseBlockSize)
                    let by = Math.floor(y * InverseBlockSize)
                    let bz = Math.floor(z * InverseBlockSize)
                    let tx = x - bx * BlockSize
                    let ty = y - by * BlockSize
                    let tz = z - bz * BlockSize
                    let tileType = world.GetTileType(bx, by, bz, tx, ty, tz)
                    if (TileClosed[tileType]) {
                        CastX = x
                        CastY = y
                        CastZ = z
                        CastSide = incrementX < 0 ? WorldPositiveX : WorldNegativeX
                        CastTileType = tileType
                        return
                    }
                    nextX += deltaX
                } else {
                    z += incrementZ
                    if (z < 0 || z >= world.tileLength) {
                        CastTileType = null
                        return
                    }
                    let bx = Math.floor(x * InverseBlockSize)
                    let by = Math.floor(y * InverseBlockSize)
                    let bz = Math.floor(z * InverseBlockSize)
                    let tx = x - bx * BlockSize
                    let ty = y - by * BlockSize
                    let tz = z - bz * BlockSize
                    let tileType = world.GetTileType(bx, by, bz, tx, ty, tz)
                    if (TileClosed[tileType]) {
                        CastX = x
                        CastY = y
                        CastZ = z
                        CastSide = incrementZ < 0 ? WorldPositiveZ : WorldNegativeZ
                        CastTileType = tileType
                        return
                    }
                    nextZ += deltaZ
                }
            } else {
                if (nextY < nextZ) {
                    y += incrementY
                    if (y < 0 || y >= world.tileHeight) {
                        CastTileType = null
                        return
                    }
                    let bx = Math.floor(x * InverseBlockSize)
                    let by = Math.floor(y * InverseBlockSize)
                    let bz = Math.floor(z * InverseBlockSize)
                    let tx = x - bx * BlockSize
                    let ty = y - by * BlockSize
                    let tz = z - bz * BlockSize
                    let tileType = world.GetTileType(bx, by, bz, tx, ty, tz)
                    if (TileClosed[tileType]) {
                        CastX = x
                        CastY = y
                        CastZ = z
                        CastSide = incrementY < 0 ? WorldPositiveY : WorldNegativeY
                        CastTileType = tileType
                        return
                    }
                    nextY += deltaY
                } else {
                    z += incrementZ
                    if (z < 0 || z >= world.tileLength) {
                        CastTileType = null
                        return
                    }
                    let bx = Math.floor(x * InverseBlockSize)
                    let by = Math.floor(y * InverseBlockSize)
                    let bz = Math.floor(z * InverseBlockSize)
                    let tx = x - bx * BlockSize
                    let ty = y - by * BlockSize
                    let tz = z - bz * BlockSize
                    let tileType = world.GetTileType(bx, by, bz, tx, ty, tz)
                    if (TileClosed[tileType]) {
                        CastX = x
                        CastY = y
                        CastZ = z
                        CastSide = incrementZ < 0 ? WorldPositiveZ : WorldNegativeZ
                        CastTileType = tileType
                        return
                    }
                    nextZ += deltaZ
                }
            }
        }
    }
}
