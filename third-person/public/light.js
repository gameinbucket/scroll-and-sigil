const LIGHT_QUEUE_LIMIT = 30 * 30 * 30
const LIGHT_QUEUE = new Array(LIGHT_QUEUE_LIMIT)
const LIGHT_QUEUE_POS = 0
const LIGHT_QUEUE_NUM = 1
const LIGHT_FADE = 0.95; // 0.8
for (let i = 0; i < LIGHT_QUEUE.length; i++) {
    LIGHT_QUEUE[i] = new Int32Array(3)
}
let LIGHT_CHUNK_X = 0
let LIGHT_CHUNK_Y = 0
let LIGHT_CHUNK_Z = 0
let LIGHT_POS = 0
let LIGHT_NUM = 0

class Light {
    constructor(x, y, z, rgb) {
        this.x = x
        this.y = y
        this.z = z
        this.rgb = rgb
    }
    static Colorize(rgb, ambient) {
        return [
            rgb[0] * ambient / 65025.0,
            rgb[1] * ambient / 65025.0,
            rgb[2] * ambient / 65025.0
        ]
    }
    static Visit(world, bx, by, bz, red, green, blue) {
        let tile = world.get_tile_pointer(LIGHT_CHUNK_X, LIGHT_CHUNK_Y, LIGHT_CHUNK_Z, bx, by, bz)
        if (tile === null || Tile.Closed(tile.type))
            return
        if (tile.red >= red || tile.green >= green || tile.blue >= blue)
            return
        tile.red = red
        tile.green = green
        tile.blue = blue

        let queue = LIGHT_POS + LIGHT_NUM
        if (queue >= LIGHT_QUEUE_LIMIT) {
            queue -= LIGHT_QUEUE_LIMIT
        }
        LIGHT_QUEUE[queue][0] = bx
        LIGHT_QUEUE[queue][1] = by
        LIGHT_QUEUE[queue][2] = bz
        LIGHT_NUM++
    }
    static Add(world, block, light) {
        LIGHT_CHUNK_X = block.x
        LIGHT_CHUNK_Y = block.y
        LIGHT_CHUNK_Z = block.z

        let color = Render.UnpackRgb(light.rgb)

        let index = light.x + light.y * CHUNK_DIM + light.z * CHUNK_SLICE
        let tile = block.tiles[index]
        tile.red = color[0]
        tile.green = color[1]
        tile.blue = color[2]

        LIGHT_QUEUE[0][0] = light.x
        LIGHT_QUEUE[0][1] = light.y
        LIGHT_QUEUE[0][2] = light.z
        LIGHT_POS = 0
        LIGHT_NUM = 1

        while (LIGHT_NUM > 0) {
            let x = LIGHT_QUEUE[LIGHT_POS][0]
            let y = LIGHT_QUEUE[LIGHT_POS][1]
            let z = LIGHT_QUEUE[LIGHT_POS][2]
            LIGHT_POS++
            if (LIGHT_POS == LIGHT_QUEUE_LIMIT) {
                LIGHT_POS = 0
            }
            LIGHT_NUM--

            let node = world.get_tile_pointer(LIGHT_CHUNK_X, LIGHT_CHUNK_Y, LIGHT_CHUNK_Z, x, y, z)
            if (node === null) {
                continue
            }

            let r = Math.floor(node.red * LIGHT_FADE)
            let g = Math.floor(node.green * LIGHT_FADE)
            let b = Math.floor(node.blue * LIGHT_FADE)

            Light.Visit(world, x - 1, y, z, r, g, b)
            Light.Visit(world, x + 1, y, z, r, g, b)
            Light.Visit(world, x, y - 1, z, r, g, b)
            Light.Visit(world, x, y + 1, z, r, g, b)
            Light.Visit(world, x, y, z - 1, r, g, b)
            Light.Visit(world, x, y, z + 1, r, g, b)
        }
    }
    static Remove(world, x, y, z) {
        let cx = Math.floor(x / CHUNK_DIM)
        let cy = Math.floor(y / CHUNK_DIM)
        let cz = Math.floor(z / CHUNK_DIM)
        let bx = x % CHUNK_DIM
        let by = y % CHUNK_DIM
        let bz = z % CHUNK_DIM
        let block = world.blocks[cx + cy * world.block_w + cz * world.block_slice]
        for (let i = 0; i < block.lights.length; i++) {
            let light = block.lights[i]
            if (light.x === bx && light.y === by && light.z === bz)
                block.lights.splice(i, 1)
        }
    }
}
