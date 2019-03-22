MATRIX_TEMP = []
MATRIX_COPIED = []
class Matrix {
    static Identity(matrix) {
        matrix[0] = 1.0
        matrix[1] = 0.0
        matrix[2] = 0.0
        matrix[3] = 0.0

        matrix[4] = 0.0
        matrix[5] = 1.0
        matrix[6] = 0.0
        matrix[7] = 0.0

        matrix[8] = 0.0
        matrix[9] = 0.0
        matrix[10] = 1.0
        matrix[11] = 0.0

        matrix[12] = 0.0
        matrix[13] = 0.0
        matrix[14] = 0.0
        matrix[15] = 1.0
    }
    static Orthographic(matrix, left, right, bottom, top, near, far) {
        matrix[0] = 2.0 / (right - left)
        matrix[1] = 0.0
        matrix[2] = 0.0
        matrix[3] = 0.0

        matrix[4] = 0.0
        matrix[5] = 2.0 / (top - bottom)
        matrix[6] = 0.0
        matrix[7] = 0.0

        matrix[8] = 0.0
        matrix[9] = 0.0
        matrix[10] = -2.0 / (far - near)
        matrix[11] = 0.0

        matrix[12] = -(right + left) / (right - left)
        matrix[13] = -(top + bottom) / (top - bottom)
        matrix[14] = -(far + near) / (far - near)
        matrix[15] = 1.0
    }
    static Perspective(matrix, fov, near, far, aspect) {
        let top = near * Math.tan(fov * Math.PI / 360.0)
        let bottom = -top
        let left = bottom * aspect
        let right = top * aspect

        Matrix.Frustum(matrix, left, right, bottom, top, near, far)
    }
    static Frustum(matrix, left, right, bottom, top, near, far) {
        matrix[0] = (2.0 * near) / (right - left)
        matrix[1] = 0.0
        matrix[2] = 0.0
        matrix[3] = 0.0

        matrix[4] = 0.0
        matrix[5] = (2.0 * near) / (top - bottom)
        matrix[6] = 0.0
        matrix[7] = 0.0

        matrix[8] = (right + left) / (right - left)
        matrix[9] = (top + bottom) / (top - bottom)
        matrix[10] = -(far + near) / (far - near)
        matrix[11] = -1.0

        matrix[12] = 0.0
        matrix[13] = 0.0
        matrix[14] = -(2.0 * far * near) / (far - near)
        matrix[15] = 0.0
    }
    static Translate(matrix, x, y, z) {
        matrix[12] = x * matrix[0] + y * matrix[4] + z * matrix[8] + matrix[12]
        matrix[13] = x * matrix[1] + y * matrix[5] + z * matrix[9] + matrix[13]
        matrix[14] = x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14]
        matrix[15] = x * matrix[3] + y * matrix[7] + z * matrix[11] + matrix[15]
    }
    static TranslateFromView(matrix, view, x, y, z) {
        matrix[0] = view[0]
        matrix[1] = view[1]
        matrix[2] = view[2]
        matrix[3] = view[3]
        matrix[4] = view[4]
        matrix[5] = view[5]
        matrix[6] = view[6]
        matrix[7] = view[7]
        matrix[8] = view[8]
        matrix[9] = view[9]
        matrix[10] = view[10]
        matrix[11] = view[11]
        matrix[12] = x * view[0] + y * view[4] + z * view[8] + view[12]
        matrix[13] = x * view[1] + y * view[5] + z * view[9] + view[13]
        matrix[14] = x * view[2] + y * view[6] + z * view[10] + view[14]
        matrix[15] = x * view[3] + y * view[7] + z * view[11] + view[15]
    }
    static RotateX(matrix, r) {
        let cos = Math.cos(r)
        let sin = Math.sin(r)

        MATRIX_TEMP[0] = 1.0
        MATRIX_TEMP[1] = 0.0
        MATRIX_TEMP[2] = 0.0
        MATRIX_TEMP[3] = 0.0

        MATRIX_TEMP[4] = 0.0
        MATRIX_TEMP[5] = cos
        MATRIX_TEMP[6] = sin
        MATRIX_TEMP[7] = 0.0

        MATRIX_TEMP[8] = 0.0
        MATRIX_TEMP[9] = -sin
        MATRIX_TEMP[10] = cos
        MATRIX_TEMP[11] = 0.0

        MATRIX_TEMP[12] = 0.0
        MATRIX_TEMP[13] = 0.0
        MATRIX_TEMP[14] = 0.0
        MATRIX_TEMP[15] = 1.0

        for (let i = 0; i < 16; i++)
            MATRIX_COPIED[i] = matrix[i]

        Matrix.Multiply(matrix, MATRIX_COPIED, MATRIX_TEMP)
    }
    static RotateY(matrix, r) {
        let cos = Math.cos(r)
        let sin = Math.sin(r)

        MATRIX_TEMP[0] = cos
        MATRIX_TEMP[1] = 0.0
        MATRIX_TEMP[2] = -sin
        MATRIX_TEMP[3] = 0.0

        MATRIX_TEMP[4] = 0.0
        MATRIX_TEMP[5] = 1.0
        MATRIX_TEMP[6] = 0.0
        MATRIX_TEMP[7] = 0.0

        MATRIX_TEMP[8] = sin
        MATRIX_TEMP[9] = 0.0
        MATRIX_TEMP[10] = cos
        MATRIX_TEMP[11] = 0.0

        MATRIX_TEMP[12] = 0.0
        MATRIX_TEMP[13] = 0.0
        MATRIX_TEMP[14] = 0.0
        MATRIX_TEMP[15] = 1.0

        for (let i = 0; i < 16; i++)
            MATRIX_COPIED[i] = matrix[i]

        Matrix.Multiply(matrix, MATRIX_COPIED, MATRIX_TEMP)
    }
    static RotateZ(matrix, r) {
        let cos = Math.cos(r)
        let sin = Math.sin(r)

        MATRIX_TEMP[0] = cos
        MATRIX_TEMP[1] = sin
        MATRIX_TEMP[2] = 0.0
        MATRIX_TEMP[3] = 0.0

        MATRIX_TEMP[4] = -sin
        MATRIX_TEMP[5] = cos
        MATRIX_TEMP[6] = 0.0
        MATRIX_TEMP[7] = 0.0

        MATRIX_TEMP[8] = 0.0
        MATRIX_TEMP[9] = 0.0
        MATRIX_TEMP[10] = 1.0
        MATRIX_TEMP[11] = 0.0

        MATRIX_TEMP[12] = 0.0
        MATRIX_TEMP[13] = 0.0
        MATRIX_TEMP[14] = 0.0
        MATRIX_TEMP[15] = 1.0

        for (let i = 0; i < 16; i++)
            MATRIX_COPIED[i] = matrix[i]

        Matrix.Multiply(matrix, MATRIX_COPIED, MATRIX_TEMP)
    }
    static Multiply(matrix, b, c) {
        matrix[0] = b[0] * c[0] + b[4] * c[1] + b[8] * c[2] + b[12] * c[3]
        matrix[1] = b[1] * c[0] + b[5] * c[1] + b[9] * c[2] + b[13] * c[3]
        matrix[2] = b[2] * c[0] + b[6] * c[1] + b[10] * c[2] + b[14] * c[3]
        matrix[3] = b[3] * c[0] + b[7] * c[1] + b[11] * c[2] + b[15] * c[3]

        matrix[4] = b[0] * c[4] + b[4] * c[5] + b[8] * c[6] + b[12] * c[7]
        matrix[5] = b[1] * c[4] + b[5] * c[5] + b[9] * c[6] + b[13] * c[7]
        matrix[6] = b[2] * c[4] + b[6] * c[5] + b[10] * c[6] + b[14] * c[7]
        matrix[7] = b[3] * c[4] + b[7] * c[5] + b[11] * c[6] + b[15] * c[7]

        matrix[8] = b[0] * c[8] + b[4] * c[9] + b[8] * c[10] + b[12] * c[11]
        matrix[9] = b[1] * c[8] + b[5] * c[9] + b[9] * c[10] + b[13] * c[11]
        matrix[10] = b[2] * c[8] + b[6] * c[9] + b[10] * c[10] + b[14] * c[11]
        matrix[11] = b[3] * c[8] + b[7] * c[9] + b[11] * c[10] + b[15] * c[11]

        matrix[12] = b[0] * c[12] + b[4] * c[13] + b[8] * c[14] + b[12] * c[15]
        matrix[13] = b[1] * c[12] + b[5] * c[13] + b[9] * c[14] + b[13] * c[15]
        matrix[14] = b[2] * c[12] + b[6] * c[13] + b[10] * c[14] + b[14] * c[15]
        matrix[15] = b[3] * c[12] + b[7] * c[13] + b[11] * c[14] + b[15] * c[15]
    }
    static Inverse(matrix, b) {
        for (let i = 0; i < 4; i++) {
            MATRIX_COPIED[i + 0] = b[i * 4 + 0]
            MATRIX_COPIED[i + 4] = b[i * 4 + 1]
            MATRIX_COPIED[i + 8] = b[i * 4 + 2]
            MATRIX_COPIED[i + 12] = b[i * 4 + 3]
        }

        MATRIX_TEMP[0] = MATRIX_COPIED[10] * MATRIX_COPIED[15]
        MATRIX_TEMP[1] = MATRIX_COPIED[11] * MATRIX_COPIED[14]
        MATRIX_TEMP[2] = MATRIX_COPIED[9] * MATRIX_COPIED[15]
        MATRIX_TEMP[3] = MATRIX_COPIED[11] * MATRIX_COPIED[13]
        MATRIX_TEMP[4] = MATRIX_COPIED[9] * MATRIX_COPIED[14]
        MATRIX_TEMP[5] = MATRIX_COPIED[10] * MATRIX_COPIED[13]
        MATRIX_TEMP[6] = MATRIX_COPIED[8] * MATRIX_COPIED[15]
        MATRIX_TEMP[7] = MATRIX_COPIED[11] * MATRIX_COPIED[12]
        MATRIX_TEMP[8] = MATRIX_COPIED[8] * MATRIX_COPIED[14]
        MATRIX_TEMP[9] = MATRIX_COPIED[10] * MATRIX_COPIED[12]
        MATRIX_TEMP[10] = MATRIX_COPIED[8] * MATRIX_COPIED[13]
        MATRIX_TEMP[11] = MATRIX_COPIED[9] * MATRIX_COPIED[12]

        matrix[0] = MATRIX_TEMP[0] * MATRIX_COPIED[5] + MATRIX_TEMP[3] * MATRIX_COPIED[6] + MATRIX_TEMP[4] * MATRIX_COPIED[7]
        matrix[0] -= MATRIX_TEMP[1] * MATRIX_COPIED[5] + MATRIX_TEMP[2] * MATRIX_COPIED[6] + MATRIX_TEMP[5] * MATRIX_COPIED[7]
        matrix[1] = MATRIX_TEMP[1] * MATRIX_COPIED[4] + MATRIX_TEMP[6] * MATRIX_COPIED[6] + MATRIX_TEMP[9] * MATRIX_COPIED[7]
        matrix[1] -= MATRIX_TEMP[0] * MATRIX_COPIED[4] + MATRIX_TEMP[7] * MATRIX_COPIED[6] + MATRIX_TEMP[8] * MATRIX_COPIED[7]
        matrix[2] = MATRIX_TEMP[2] * MATRIX_COPIED[4] + MATRIX_TEMP[7] * MATRIX_COPIED[5] + MATRIX_TEMP[10] * MATRIX_COPIED[7]
        matrix[2] -= MATRIX_TEMP[3] * MATRIX_COPIED[4] + MATRIX_TEMP[6] * MATRIX_COPIED[5] + MATRIX_TEMP[11] * MATRIX_COPIED[7]
        matrix[3] = MATRIX_TEMP[5] * MATRIX_COPIED[4] + MATRIX_TEMP[8] * MATRIX_COPIED[5] + MATRIX_TEMP[11] * MATRIX_COPIED[6]
        matrix[3] -= MATRIX_TEMP[4] * MATRIX_COPIED[4] + MATRIX_TEMP[9] * MATRIX_COPIED[5] + MATRIX_TEMP[10] * MATRIX_COPIED[6]
        matrix[4] = MATRIX_TEMP[1] * MATRIX_COPIED[1] + MATRIX_TEMP[2] * MATRIX_COPIED[2] + MATRIX_TEMP[5] * MATRIX_COPIED[3]
        matrix[4] -= MATRIX_TEMP[0] * MATRIX_COPIED[1] + MATRIX_TEMP[3] * MATRIX_COPIED[2] + MATRIX_TEMP[4] * MATRIX_COPIED[3]
        matrix[5] = MATRIX_TEMP[0] * MATRIX_COPIED[0] + MATRIX_TEMP[7] * MATRIX_COPIED[2] + MATRIX_TEMP[8] * MATRIX_COPIED[3]
        matrix[5] -= MATRIX_TEMP[1] * MATRIX_COPIED[0] + MATRIX_TEMP[6] * MATRIX_COPIED[2] + MATRIX_TEMP[9] * MATRIX_COPIED[3]
        matrix[6] = MATRIX_TEMP[3] * MATRIX_COPIED[0] + MATRIX_TEMP[6] * MATRIX_COPIED[1] + MATRIX_TEMP[11] * MATRIX_COPIED[3]
        matrix[6] -= MATRIX_TEMP[2] * MATRIX_COPIED[0] + MATRIX_TEMP[7] * MATRIX_COPIED[1] + MATRIX_TEMP[10] * MATRIX_COPIED[3]
        matrix[7] = MATRIX_TEMP[4] * MATRIX_COPIED[0] + MATRIX_TEMP[9] * MATRIX_COPIED[1] + MATRIX_TEMP[10] * MATRIX_COPIED[2]
        matrix[7] -= MATRIX_TEMP[5] * MATRIX_COPIED[0] + MATRIX_TEMP[8] * MATRIX_COPIED[1] + MATRIX_TEMP[11] * MATRIX_COPIED[2]

        MATRIX_TEMP[0] = MATRIX_COPIED[2] * MATRIX_COPIED[7]
        MATRIX_TEMP[1] = MATRIX_COPIED[3] * MATRIX_COPIED[6]
        MATRIX_TEMP[2] = MATRIX_COPIED[1] * MATRIX_COPIED[7]
        MATRIX_TEMP[3] = MATRIX_COPIED[3] * MATRIX_COPIED[5]
        MATRIX_TEMP[4] = MATRIX_COPIED[1] * MATRIX_COPIED[6]
        MATRIX_TEMP[5] = MATRIX_COPIED[2] * MATRIX_COPIED[5]
        MATRIX_TEMP[6] = MATRIX_COPIED[0] * MATRIX_COPIED[7]
        MATRIX_TEMP[7] = MATRIX_COPIED[3] * MATRIX_COPIED[4]
        MATRIX_TEMP[8] = MATRIX_COPIED[0] * MATRIX_COPIED[6]
        MATRIX_TEMP[9] = MATRIX_COPIED[2] * MATRIX_COPIED[4]
        MATRIX_TEMP[10] = MATRIX_COPIED[0] * MATRIX_COPIED[5]
        MATRIX_TEMP[11] = MATRIX_COPIED[1] * MATRIX_COPIED[4]

        matrix[8] = MATRIX_TEMP[0] * MATRIX_COPIED[13] + MATRIX_TEMP[3] * MATRIX_COPIED[14] + MATRIX_TEMP[4] * MATRIX_COPIED[15]
        matrix[8] -= MATRIX_TEMP[1] * MATRIX_COPIED[13] + MATRIX_TEMP[2] * MATRIX_COPIED[14] + MATRIX_TEMP[5] * MATRIX_COPIED[15]
        matrix[9] = MATRIX_TEMP[1] * MATRIX_COPIED[12] + MATRIX_TEMP[6] * MATRIX_COPIED[14] + MATRIX_TEMP[9] * MATRIX_COPIED[15]
        matrix[9] -= MATRIX_TEMP[0] * MATRIX_COPIED[12] + MATRIX_TEMP[7] * MATRIX_COPIED[14] + MATRIX_TEMP[8] * MATRIX_COPIED[15]
        matrix[10] = MATRIX_TEMP[2] * MATRIX_COPIED[12] + MATRIX_TEMP[7] * MATRIX_COPIED[13] + MATRIX_TEMP[10] * MATRIX_COPIED[15]
        matrix[10] -= MATRIX_TEMP[3] * MATRIX_COPIED[12] + MATRIX_TEMP[6] * MATRIX_COPIED[13] + MATRIX_TEMP[11] * MATRIX_COPIED[15]
        matrix[11] = MATRIX_TEMP[5] * MATRIX_COPIED[12] + MATRIX_TEMP[8] * MATRIX_COPIED[13] + MATRIX_TEMP[11] * MATRIX_COPIED[14]
        matrix[11] -= MATRIX_TEMP[4] * MATRIX_COPIED[12] + MATRIX_TEMP[9] * MATRIX_COPIED[13] + MATRIX_TEMP[10] * MATRIX_COPIED[14]
        matrix[12] = MATRIX_TEMP[2] * MATRIX_COPIED[10] + MATRIX_TEMP[5] * MATRIX_COPIED[11] + MATRIX_TEMP[1] * MATRIX_COPIED[9]
        matrix[12] -= MATRIX_TEMP[4] * MATRIX_COPIED[11] + MATRIX_TEMP[0] * MATRIX_COPIED[9] + MATRIX_TEMP[3] * MATRIX_COPIED[10]
        matrix[13] = MATRIX_TEMP[8] * MATRIX_COPIED[11] + MATRIX_TEMP[0] * MATRIX_COPIED[8] + MATRIX_TEMP[7] * MATRIX_COPIED[10]
        matrix[13] -= MATRIX_TEMP[6] * MATRIX_COPIED[10] + MATRIX_TEMP[9] * MATRIX_COPIED[11] + MATRIX_TEMP[1] * MATRIX_COPIED[8]
        matrix[14] = MATRIX_TEMP[6] * MATRIX_COPIED[9] + MATRIX_TEMP[11] * MATRIX_COPIED[11] + MATRIX_TEMP[3] * MATRIX_COPIED[8]
        matrix[14] -= MATRIX_TEMP[10] * MATRIX_COPIED[11] + MATRIX_TEMP[2] * MATRIX_COPIED[8] + MATRIX_TEMP[7] * MATRIX_COPIED[9]
        matrix[15] = MATRIX_TEMP[10] * MATRIX_COPIED[10] + MATRIX_TEMP[4] * MATRIX_COPIED[8] + MATRIX_TEMP[9] * MATRIX_COPIED[9]
        matrix[15] -= MATRIX_TEMP[8] * MATRIX_COPIED[9] + MATRIX_TEMP[11] * MATRIX_COPIED[10] + MATRIX_TEMP[5] * MATRIX_COPIED[8]

        let det = 1.0 / (MATRIX_COPIED[0] * matrix[0] + MATRIX_COPIED[1] * matrix[1] + MATRIX_COPIED[2] * matrix[2] + MATRIX_COPIED[3] * matrix[3])

        for (let i = 0; i < 16; i++)
            matrix[i] *= det
    }
}