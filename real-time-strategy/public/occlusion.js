const OCCLUSION_SLICE_A = new Int32Array(3);
const OCCLUSION_SLICE_B = new Int32Array(3);
const OCCLUSION_FULLY = 0;
const OCCLUSION_PARTIALLY = 1;
const OCCLUSION_NOTHING = 2;
const OCCLUSION_QUEUE = [];
const OCCLUSION_GOTO = [];
const OCCLUSION_QUEUE_FROM = [];
const FRUSTUM = new Array(6);
for (let i = 0; i < FRUSTUM.length; i++) {
    FRUSTUM[i] = new Float32Array(4);
}
let OCCLUSION_VIEW_NUM = 0;
let OCCLUSION_QUEUE_POS = 0;
let OCCLUSION_QUEUE_NUM = 0;
class Occlusion {
    static Calculate(chunk) {
        for (let side_a = 0; side_a < 6; side_a++) {
            let ax = SLICE_X[side_a];
            let ay = SLICE_Y[side_a];
            let az = SLICE_Z[side_a];
            for (let side_b = side_a + 1; side_b < 6; side_b++) {
                let bx = SLICE_X[side_b];
                let by = SLICE_Y[side_b];
                let bz = SLICE_Z[side_b];

                if (SLICE_TOWARDS[side_a] > 0) {
                    OCCLUSION_SLICE_A[2] = CHUNK_DIM - 1;
                } else {
                    OCCLUSION_SLICE_A[2] = 0;
                }

                if (SLICE_TOWARDS[side_b] > 0) {
                    OCCLUSION_SLICE_B[2] = CHUNK_DIM - 1;
                } else {
                    OCCLUSION_SLICE_B[2] = 0;
                }
                loop:
                    for (OCCLUSION_SLICE_A[1] = 0; OCCLUSION_SLICE_A[1] < CHUNK_DIM; OCCLUSION_SLICE_A[1]++) {
                        for (OCCLUSION_SLICE_A[0] = 0; OCCLUSION_SLICE_A[0] < CHUNK_DIM; OCCLUSION_SLICE_A[0]++) {
                            for (OCCLUSION_SLICE_B[1] = 0; OCCLUSION_SLICE_B[1] < CHUNK_DIM; OCCLUSION_SLICE_B[1]++) {
                                for (OCCLUSION_SLICE_B[0] = 0; OCCLUSION_SLICE_B[0] < CHUNK_DIM; OCCLUSION_SLICE_B[0]++) {
                                    let from_x = OCCLUSION_SLICE_A[ax] + 0.5;
                                    let from_y = OCCLUSION_SLICE_A[ay] + 0.5;
                                    let from_z = OCCLUSION_SLICE_A[az] + 0.5;
                                    let to_x = OCCLUSION_SLICE_B[bx] + 0.5;
                                    let to_y = OCCLUSION_SLICE_B[by] + 0.5;
                                    let to_z = OCCLUSION_SLICE_B[bz] + 0.5;
                                    if (Cast.Chunk(chunk, from_x, from_y, from_z, to_x, to_y, to_z)) {
                                        chunk.visibility |= 1 << (side_a * 6 + side_b)
                                        break loop;
                                    }
                                }
                            }
                        }
                    }
            }
        }
    }
    static PrepareFrustum(g) {
        // left
        FRUSTUM[0][0] = g.mvp[3] + g.mvp[0]
        FRUSTUM[0][1] = g.mvp[7] + g.mvp[4]
        FRUSTUM[0][2] = g.mvp[11] + g.mvp[8]
        FRUSTUM[0][3] = g.mvp[15] + g.mvp[12]
        Occlusion.NormalizePlane(FRUSTUM, 0)

        // right
        FRUSTUM[1][0] = g.mvp[3] - g.mvp[0]
        FRUSTUM[1][1] = g.mvp[7] - g.mvp[4]
        FRUSTUM[1][2] = g.mvp[11] - g.mvp[8]
        FRUSTUM[1][3] = g.mvp[15] - g.mvp[12]
        Occlusion.NormalizePlane(FRUSTUM, 1)

        // top
        FRUSTUM[2][0] = g.mvp[3] - g.mvp[1]
        FRUSTUM[2][1] = g.mvp[7] - g.mvp[5]
        FRUSTUM[2][2] = g.mvp[11] - g.mvp[9]
        FRUSTUM[2][3] = g.mvp[15] - g.mvp[13]
        Occlusion.NormalizePlane(FRUSTUM, 2)

        // bottom
        FRUSTUM[3][0] = g.mvp[3] + g.mvp[1]
        FRUSTUM[3][1] = g.mvp[7] + g.mvp[5]
        FRUSTUM[3][2] = g.mvp[11] + g.mvp[9]
        FRUSTUM[3][3] = g.mvp[15] + g.mvp[13]
        Occlusion.NormalizePlane(FRUSTUM, 3)

        // near
        FRUSTUM[4][0] = g.mvp[3] + g.mvp[2]
        FRUSTUM[4][1] = g.mvp[7] + g.mvp[6]
        FRUSTUM[4][2] = g.mvp[11] + g.mvp[10]
        FRUSTUM[4][3] = g.mvp[15] + g.mvp[14]
        Occlusion.NormalizePlane(FRUSTUM, 4)

        // far
        FRUSTUM[5][0] = g.mvp[3] - g.mvp[2]
        FRUSTUM[5][1] = g.mvp[7] - g.mvp[6]
        FRUSTUM[5][2] = g.mvp[11] - g.mvp[10]
        FRUSTUM[5][3] = g.mvp[15] - g.mvp[14]
        Occlusion.NormalizePlane(FRUSTUM, 5)
    }
    static NormalizePlane(FRUSTUM, i) {
        let n = Math.sqrt(FRUSTUM[i][0] * FRUSTUM[i][0] + FRUSTUM[i][1] * FRUSTUM[i][1] + FRUSTUM[i][2] * FRUSTUM[i][2])
        FRUSTUM[i][0] /= n
        FRUSTUM[i][1] /= n
        FRUSTUM[i][2] /= n
        FRUSTUM[i][3] /= n
    }
    static Occlude(world, lx, ly, lz) {

        OCCLUSION_VIEW_NUM = 0

        let index = lx + ly * world.chunk_w + lz * world.chunk_slice
        if (index < 0 || index >= world.chunk_all) {
            while (OCCLUSION_VIEW_NUM < world.chunk_all) {
                world.viewable[OCCLUSION_VIEW_NUM] = world.chunks[OCCLUSION_VIEW_NUM]
                OCCLUSION_VIEW_NUM++
            }
            return
        }

        OCCLUSION_QUEUE_POS = 0
        OCCLUSION_QUEUE_NUM = 1
        OCCLUSION_QUEUE[0] = world.chunks[index]
        OCCLUSION_QUEUE_FROM[0] = -1

        for (let i = 0; i < world.chunk_all; i++) {
            OCCLUSION_GOTO[i] = true
        }
        while (OCCLUSION_QUEUE_NUM > 0) {
            let B = OCCLUSION_QUEUE[OCCLUSION_QUEUE_POS]
            let from = OCCLUSION_QUEUE_FROM[OCCLUSION_QUEUE_POS]

            world.viewable[OCCLUSION_VIEW_NUM] = B
            OCCLUSION_VIEW_NUM++

            OCCLUSION_QUEUE_POS++
            if (OCCLUSION_QUEUE_POS === world.chunk_all) {
                OCCLUSION_QUEUE_POS = 0
            }
            OCCLUSION_QUEUE_NUM--

            if (from !== WORLD_NEGATIVE_X) {
                Occlusion.Visit(world, from, B, WORLD_POSITIVE_X)
            }
            if (from !== WORLD_POSITIVE_X) {
                Occlusion.Visit(world, from, B, WORLD_NEGATIVE_X)
            }
            if (from !== WORLD_NEGATIVE_Y) {
                Occlusion.Visit(world, from, B, WORLD_POSITIVE_Y)
            }
            if (from !== WORLD_POSITIVE_Y) {
                Occlusion.Visit(world, from, B, WORLD_NEGATIVE_Y)
            }
            if (from !== WORLD_NEGATIVE_Z) {
                Occlusion.Visit(world, from, B, WORLD_POSITIVE_Z)
            }
            if (from !== WORLD_POSITIVE_Z) {
                Occlusion.Visit(world, from, B, WORLD_NEGATIVE_Z)
            }
        }
    }
    static Visit(world, from, B, to) {
        let x = B.x
        let y = B.y
        let z = B.z
        switch (to) {
            case WORLD_POSITIVE_X:
                x++
                if (x === world.chunk_w) {
                    return
                }
                break
            case WORLD_NEGATIVE_X:
                x--
                if (x === -1) {
                    return
                }
                break
            case WORLD_POSITIVE_Y:
                y++
                if (y === world.chunk_h) {
                    return
                }
                break
            case WORLD_NEGATIVE_Y:
                y--
                if (y === -1) {
                    return
                }
                break
            case WORLD_POSITIVE_Z:
                z++
                if (z === world.chunk_l) {
                    return
                }
                break
            case WORLD_NEGATIVE_Z:
                z--
                if (z === -1) {
                    return
                }
                break
        }
        let index = x + y * world.chunk_w + z * world.chunk_slice
        if (OCCLUSION_GOTO[index] === false) {
            return
        }
        if (from >= 0) {
            switch (from) {
                case WORLD_POSITIVE_X:
                    from = WORLD_NEGATIVE_X
                    break
                case WORLD_NEGATIVE_X:
                    from = WORLD_POSITIVE_X
                    break
                case WORLD_POSITIVE_Y:
                    from = WORLD_NEGATIVE_Y
                    break
                case WORLD_NEGATIVE_Y:
                    from = WORLD_POSITIVE_Y
                    break
                case WORLD_POSITIVE_Z:
                    from = WORLD_NEGATIVE_Z
                    break
                case WORLD_NEGATIVE_Z:
                    from = WORLD_POSITIVE_Z
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
            if (B.visibility & (1 << (side_a * 6 + side_b)) === 0) {
                return
            }
        }
        OCCLUSION_GOTO[index] = false
        let C = world.chunks[index]
        let pos_cx = C.x * CHUNK_DIM
        let pos_cy = C.y * CHUNK_DIM
        let pos_cz = C.z * CHUNK_DIM
        let box = Occlusion.InBox(
            pos_cx + CHUNK_DIM, pos_cy + CHUNK_DIM, pos_cz + CHUNK_DIM,
            pos_cx, pos_cy, pos_cz)
        if (box === OCCLUSION_NOTHING) {
            return
        }
        let queue = OCCLUSION_QUEUE_POS + OCCLUSION_QUEUE_NUM
        if (queue >= world.chunk_all) {
            queue -= world.chunk_all
        }
        OCCLUSION_QUEUE[queue] = C
        OCCLUSION_QUEUE_FROM[queue] = to
        OCCLUSION_QUEUE_NUM++
    }
    static InBox(pos_x, pos_y, pos_z, neg_x, neg_y, neg_z) {
        let pvx, pvy, pvz
        let nvx, nvy, nvz
        let result = OCCLUSION_FULLY
        for (let i = 0; i < 6; i++) {
            let plane = FRUSTUM[i]
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
            if (pvx * plane[0] + pvy * plane[1] + pvz * plane[2] + plane[3] < 0) {
                return OCCLUSION_NOTHING
            }
            if (nvx * plane[0] + nvy * plane[1] + nvz * plane[2] + plane[3] < 0) {
                result = OCCLUSION_PARTIALLY
            }
        }
        return result
    }
}