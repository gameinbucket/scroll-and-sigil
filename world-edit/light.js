const LIGHT_QUEUE_LIMIT = 30 * 30 * 30;
const LIGHT_QUEUE = new Array(LIGHT_QUEUE_LIMIT);
const LIGHT_QUEUE_POS = 0;
const LIGHT_QUEUE_NUM = 1;
const LIGHT_FADE = 0.8;
for (let i = 0; i < LIGHT_QUEUE.length; i++) {
    LIGHT_QUEUE[i] = new Int32Array(3);
}
let LIGHT_X = 0;
let LIGHT_Y = 0;
let LIGHT_Z = 0;
let LIGHT_POS = 0;
let LIGHT_NUM = 0;
class Light {
    static Colorize(rgb, ambient) {
        return [
            rgb[0] / 255.0 * ambient,
            rgb[1] / 255.0 * ambient,
            rgb[2] / 255.0 * ambient
        ];
    }
    static Visit(world, bx, by, bz, red, green, blue) {
        let block = world.get_block_pointer(LIGHT_X, LIGHT_Y, LIGHT_Z, bx, by, bz);
        if (block === null || Block.Closed(block.type)) {
            return;
        }
        if (block.red >= red || block.green >= green || block.blue >= blue) {
            return;
        }
        block.red = red;
        block.green = green;
        block.blue = blue;
        
        let queue = LIGHT_POS + LIGHT_NUM;
        if (queue >= LIGHT_QUEUE_LIMIT) {
            queue -= LIGHT_QUEUE_LIMIT;
        } 
        LIGHT_QUEUE[queue][0] = bx;
        LIGHT_QUEUE[queue][1] = by;
        LIGHT_QUEUE[queue][2] = bz;
        LIGHT_NUM++;
    }
    static Process(world, chunk) {
        LIGHT_X = chunk.x;
        LIGHT_Y = chunk.y;
        LIGHT_Z = chunk.z;
        for (let bz = 0; bz < CHUNK_DIM; bz++) {
            for (let by = 0; by < CHUNK_DIM; by++) {
                for (let bx = 0; bx < CHUNK_DIM; bx++) {
                    let index = bx + by * CHUNK_DIM + bz * CHUNK_SLICE;
                    let block = chunk.blocks[index];
                    if (block.light === 0) {
                        continue;
                    }
                    let color = Render.UnpackRgb(block.light);
                    block.red = color[0];
                    block.green = color[1];
                    block.blue = color[2];
                    
                    LIGHT_QUEUE[0][0] = bx;
                    LIGHT_QUEUE[0][1] = by;
                    LIGHT_QUEUE[0][2] = bz;
                    LIGHT_POS = 0;
                    LIGHT_NUM = 1;

                    while (LIGHT_NUM > 0) {
                        let x = LIGHT_QUEUE[LIGHT_POS][0];
                        let y = LIGHT_QUEUE[LIGHT_POS][1];
                        let z = LIGHT_QUEUE[LIGHT_POS][2];
                        LIGHT_POS++;
                        if (LIGHT_POS == LIGHT_QUEUE_LIMIT) {
                            LIGHT_POS = 0;
                        }
                        LIGHT_NUM--;

                        let node = world.get_block_pointer(LIGHT_X, LIGHT_Y, LIGHT_Z, x, y, z);
                        if (node === null) {
                            continue;
                        }

						let r = Math.floor(node.red * LIGHT_FADE);
						let g = Math.floor(node.green * LIGHT_FADE);
                        let b = Math.floor(node.blue * LIGHT_FADE);
                        
						Light.Visit(world, x - 1, y, z, r, g, b);
						Light.Visit(world, x + 1, y, z, r, g, b);
						Light.Visit(world, x, y - 1, z, r, g, b);
						Light.Visit(world, x, y + 1, z, r, g, b);
						Light.Visit(world, x, y, z - 1, r, g, b);
						Light.Visit(world, x, y, z + 1, r, g, b);
                    }
                }
            }
        }
    }
}