const REGION_SIZE = 8
const INV_REGION_SIZE = 1.0 / REGION_SIZE
const REGION_TOTAL = REGION_SIZE * REGION_SIZE

class Region {
    constructor(px, py) {
        this.blocks = new Uint8Array(REGION_TOTAL)
        this.x = px
        this.y = py
    }
    save() {}
    get_block(x, y) {}
}