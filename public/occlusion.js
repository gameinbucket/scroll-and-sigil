const OCCLUSION_SLICE_A = new Int32Array(3)
const OCCLUSION_SLICE_B = new Int32Array(3)
const OCCLUSION_FULLY = 0
const OCCLUSION_PARTIALLY = 1
const OCCLUSION_NOTHING = 2
const OCCLUSION_QUEUE = []
const OCCLUSION_GOTO = []
const OCCLUSION_QUEUE_FROM = []
let OCCLUSION_VIEW_NUM = 0
let OCCLUSION_QUEUE_POS = 0
let OCCLUSION_QUEUE_NUM = 0

class Occluder {
    constructor() {
        this.frustum = []
        for (let i = 0; i < 6; i++)
            this.frustum.push(new Float32Array(4))
    }
    static SetBlockVisible(block) {
        for (let side_a = 0; side_a < 6; side_a++) {
            let ax = SLICE_X[side_a]
            let ay = SLICE_Y[side_a]
            let az = SLICE_Z[side_a]
            for (let side_b = side_a + 1; side_b < 6; side_b++) {
                let bx = SLICE_X[side_b]
                let by = SLICE_Y[side_b]
                let bz = SLICE_Z[side_b]

                if (SLICE_TOWARDS[side_a] > 0) OCCLUSION_SLICE_A[2] = BlockSize - 1
                else OCCLUSION_SLICE_A[2] = 0

                if (SLICE_TOWARDS[side_b] > 0) OCCLUSION_SLICE_B[2] = BlockSize - 1
                else OCCLUSION_SLICE_B[2] = 0

                loop:
                    for (OCCLUSION_SLICE_A[1] = 0; OCCLUSION_SLICE_A[1] < BlockSize; OCCLUSION_SLICE_A[1]++) {
                        for (OCCLUSION_SLICE_A[0] = 0; OCCLUSION_SLICE_A[0] < BlockSize; OCCLUSION_SLICE_A[0]++) {
                            for (OCCLUSION_SLICE_B[1] = 0; OCCLUSION_SLICE_B[1] < BlockSize; OCCLUSION_SLICE_B[1]++) {
                                for (OCCLUSION_SLICE_B[0] = 0; OCCLUSION_SLICE_B[0] < BlockSize; OCCLUSION_SLICE_B[0]++) {
                                    let from_x = OCCLUSION_SLICE_A[ax] + 0.5
                                    let from_y = OCCLUSION_SLICE_A[ay] + 0.5
                                    let from_z = OCCLUSION_SLICE_A[az] + 0.5
                                    let to_x = OCCLUSION_SLICE_B[bx] + 0.5
                                    let to_y = OCCLUSION_SLICE_B[by] + 0.5
                                    let to_z = OCCLUSION_SLICE_B[bz] + 0.5
                                    if (Cast.Chunk(block, from_x, from_y, from_z, to_x, to_y, to_z)) {
                                        block.visibility[side_a * 6 + side_b] = 1
                                        break loop
                                    }
                                }
                            }
                        }
                    }
            }
        }
    }
    visit(world, from, B, to) {
        let x = B.x
        let y = B.y
        let z = B.z
        switch (to) {
            case WorldPositiveX:
                x++
                if (x === world.width) return
                break
            case WorldNegativeX:
                x--
                if (x === -1) return
                break
            case WorldPositiveY:
                y++
                if (y === world.height) return
                break
            case WorldNegativeY:
                y--
                if (y === -1) return
                break
            case WorldPositiveZ:
                z++
                if (z === world.length) return
                break
            case WorldNegativeZ:
                z--
                if (z === -1) return
                break
        }
        let index = x + y * world.width + z * world.slice
        if (OCCLUSION_GOTO[index] === false)
            return
        if (from >= 0) {
            switch (from) {
                case WorldPositiveX:
                    from = WorldNegativeX
                    break
                case WorldNegativeX:
                    from = WorldPositiveX
                    break
                case WorldPositiveY:
                    from = WorldNegativeY
                    break
                case WorldNegativeY:
                    from = WorldPositiveY
                    break
                case WorldPositiveZ:
                    from = WorldNegativeZ
                    break
                case WorldNegativeZ:
                    from = WorldPositiveZ
                    break
            }
            let side_a, side_b
            if (from < to) {
                side_a = from
                side_b = to
            } else {
                side_a = to
                side_b = from
            }
            if (B.visibility[side_a * 6 + side_b] === 0)
                return
        }
        OCCLUSION_GOTO[index] = false
        let C = world.blocks[index]
        let pos_cx = C.x * BlockSize
        let pos_cy = C.y * BlockSize
        let pos_cz = C.z * BlockSize
        let box = this.in_box(
            pos_cx + BlockSize, pos_cy + BlockSize, pos_cz + BlockSize,
            pos_cx, pos_cy, pos_cz)
        if (box === OCCLUSION_NOTHING)
            return

        let queue = OCCLUSION_QUEUE_POS + OCCLUSION_QUEUE_NUM
        if (queue >= world.all)
            queue -= world.all

        OCCLUSION_QUEUE[queue] = C
        OCCLUSION_QUEUE_FROM[queue] = to
        OCCLUSION_QUEUE_NUM++
    }
    in_box(pos_x, pos_y, pos_z, neg_x, neg_y, neg_z) {
        let pvx, pvy, pvz
        let nvx, nvy, nvz
        let result = OCCLUSION_FULLY
        for (let i = 0; i < 6; i++) {
            let plane = this.frustum[i]
            if (plane[0] > 0) {
                pvx = pos_x
                nvx = neg_x
            } else {
                pvx = neg_x
                nvx = pos_x
            }
            if (plane[1] > 0) {
                pvy = pos_y
                nvy = neg_y
            } else {
                pvy = neg_y
                nvy = pos_y
            }
            if (plane[2] > 0) {
                pvz = pos_z
                nvz = neg_z
            } else {
                pvz = neg_z
                nvz = pos_z
            }
            if (pvx * plane[0] + pvy * plane[1] + pvz * plane[2] + plane[3] < 0)
                return OCCLUSION_NOTHING
            if (nvx * plane[0] + nvy * plane[1] + nvz * plane[2] + plane[3] < 0)
                result = OCCLUSION_PARTIALLY
        }
        return result
    }
    prepare_frustum(g) {
        // left
        this.frustum[0][0] = g.mvp[3] + g.mvp[0]
        this.frustum[0][1] = g.mvp[7] + g.mvp[4]
        this.frustum[0][2] = g.mvp[11] + g.mvp[8]
        this.frustum[0][3] = g.mvp[15] + g.mvp[12]
        this.normalize_plane(0)

        // right
        this.frustum[1][0] = g.mvp[3] - g.mvp[0]
        this.frustum[1][1] = g.mvp[7] - g.mvp[4]
        this.frustum[1][2] = g.mvp[11] - g.mvp[8]
        this.frustum[1][3] = g.mvp[15] - g.mvp[12]
        this.normalize_plane(1)

        // top
        this.frustum[2][0] = g.mvp[3] - g.mvp[1]
        this.frustum[2][1] = g.mvp[7] - g.mvp[5]
        this.frustum[2][2] = g.mvp[11] - g.mvp[9]
        this.frustum[2][3] = g.mvp[15] - g.mvp[13]
        this.normalize_plane(2)

        // bottom
        this.frustum[3][0] = g.mvp[3] + g.mvp[1]
        this.frustum[3][1] = g.mvp[7] + g.mvp[5]
        this.frustum[3][2] = g.mvp[11] + g.mvp[9]
        this.frustum[3][3] = g.mvp[15] + g.mvp[13]
        this.normalize_plane(3)

        // near
        this.frustum[4][0] = g.mvp[3] + g.mvp[2]
        this.frustum[4][1] = g.mvp[7] + g.mvp[6]
        this.frustum[4][2] = g.mvp[11] + g.mvp[10]
        this.frustum[4][3] = g.mvp[15] + g.mvp[14]
        this.normalize_plane(4)

        // far
        this.frustum[5][0] = g.mvp[3] - g.mvp[2]
        this.frustum[5][1] = g.mvp[7] - g.mvp[6]
        this.frustum[5][2] = g.mvp[11] - g.mvp[10]
        this.frustum[5][3] = g.mvp[15] - g.mvp[14]
        this.normalize_plane(5)
    }
    normalize_plane(i) {
        let n = Math.sqrt(this.frustum[i][0] * this.frustum[i][0] + this.frustum[i][1] * this.frustum[i][1] + this.frustum[i][2] * this.frustum[i][2])
        this.frustum[i][0] /= n
        this.frustum[i][1] /= n
        this.frustum[i][2] /= n
        this.frustum[i][3] /= n
    }
    occlude(world, lx, ly, lz) {
        OCCLUSION_VIEW_NUM = 0

        let index = lx + ly * world.width + lz * world.slice
        if (index < 0 || index >= world.all) {
            while (OCCLUSION_VIEW_NUM < world.all) {
                world.viewable[OCCLUSION_VIEW_NUM] = world.blocks[OCCLUSION_VIEW_NUM]
                OCCLUSION_VIEW_NUM++
            }
            return
        }

        OCCLUSION_QUEUE_POS = 0
        OCCLUSION_QUEUE_NUM = 1
        OCCLUSION_QUEUE[0] = world.blocks[index]
        OCCLUSION_QUEUE_FROM[0] = -1

        for (let i = 0; i < world.all; i++)
            OCCLUSION_GOTO[i] = true

        while (OCCLUSION_QUEUE_NUM > 0) {
            let B = OCCLUSION_QUEUE[OCCLUSION_QUEUE_POS]
            let from = OCCLUSION_QUEUE_FROM[OCCLUSION_QUEUE_POS]

            world.viewable[OCCLUSION_VIEW_NUM] = B
            OCCLUSION_VIEW_NUM++

            OCCLUSION_QUEUE_POS++
            if (OCCLUSION_QUEUE_POS === world.all)
                OCCLUSION_QUEUE_POS = 0

            OCCLUSION_QUEUE_NUM--

            if (from !== WorldNegativeX)
                this.visit(world, from, B, WorldPositiveX)

            if (from !== WorldPositiveX)
                this.visit(world, from, B, WorldNegativeX)

            if (from !== WorldNegativeY)
                this.visit(world, from, B, WorldPositiveY)

            if (from !== WorldPositiveY)
                this.visit(world, from, B, WorldNegativeY)

            if (from !== WorldNegativeZ)
                this.visit(world, from, B, WorldPositiveZ)

            if (from !== WorldPositiveZ)
                this.visit(world, from, B, WorldNegativeZ)
        }
    }
}
