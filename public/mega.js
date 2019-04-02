const HalfPi = Math.PI * 0.5
const QuarterPi = Math.PI * 0.25
const Tau = Math.PI * 2.0
const RadToDeg = 180.0 / Math.PI
const DegToRad = Math.PI / 180.0
class Network {
    static Request(file) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest()
            request.open("GET", file)
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.responseText)
            }
            request.onerror = reject
            request.send()
        })
    }
    static Send(url, data) {
        return new Promise(function (resolve, reject) {
            const request = new XMLHttpRequest()
            request.open("POST", url)
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.responseText)
            }
            request.onerror = reject
            request.send(data)
        })
    }
    static Socket(url) {
        return new Promise(function (resolve, reject) {
            let socket = new WebSocket(url)
            socket.onopen = function () {
                resolve(socket)
            }
            socket.onerror = function (err) {
                reject(err)
            }
        })
    }
}
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
}const SpriteScale = 1.0 / 64.0

class Sprite {
    constructor(atlas, width, height, left, top, right, bottom, ox, oy) {
        this.atlas = atlas
        this.width = width
        this.half_width = width * 0.5
        this.height = height
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
        this.ox = ox
        this.oy = oy
    }
    static Simple(left, top, width, height, atlas_width, atlas_height) {
        return [
            left * atlas_width,
            top * atlas_height,
            (left + width) * atlas_width,
            (top + height) * atlas_height
        ]
    }
    static Build(atlas, atlas_width, atlas_height) {
        let left = atlas[0] * atlas_width
        let top = atlas[1] * atlas_height
        let right = (atlas[0] + atlas[2]) * atlas_width
        let bottom = (atlas[1] + atlas[3]) * atlas_height

        let width = atlas[2]
        let height = atlas[3]

        let ox = 0
        let oy = 0
        if (atlas.length > 4) {
            ox = atlas[4]
            oy = atlas[5]
        }

        return new Sprite(atlas, width, height, left, top, right, bottom, ox, oy)
    }
    static Build3(atlas, atlas_width, atlas_height) {
        let left = atlas[0] * atlas_width
        let top = atlas[1] * atlas_height
        let right = (atlas[0] + atlas[2]) * atlas_width
        let bottom = (atlas[1] + atlas[3]) * atlas_height

        let width = atlas[2] * SpriteScale
        let height = atlas[3] * SpriteScale

        let ox = 0
        let oy = 0
        if (atlas.length > 4) {
            ox = atlas[4] * SpriteScale
            oy = atlas[5] * SpriteScale
        }

        return new Sprite(atlas, width, height, left, top, right, bottom, ox, oy)
    }
    static Copy(sprite, ox, oy) {
        return new Sprite(sprite.atlas, sprite.width, sprite.height, sprite.left, sprite.top, sprite.right, sprite.bottom, ox, oy)
    }
}
class RenderSystem {
    constructor() {
        this.v = []
        this.mv = []
        this.mvp = []
        this.ip = []
        this.iv = []

        this.program
        this.program_name
        this.mvp_location = {}
        this.texture_location = {}
        this.shaders = {}
        this.textures = {}
    }
    set_texture(gl, name) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[name])
        gl.uniform1i(this.texture_location[this.program_name], 0)
    }
    set_texture_direct(gl, texture) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(this.texture_location[this.program_name], 0)
    }
    set_program(gl, name) {
        this.program = this.shaders[name]
        this.program_name = name
        gl.useProgram(this.program)
    }
    static SetFrameBuffer(gl, fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    }
    static SetView(gl, x, y, width, height) {
        gl.viewport(x, y, width, height)
        gl.scissor(x, y, width, height)
    }
    static BindVao(gl, buffer) {
        gl.bindVertexArray(buffer.vao)
    }
    static UpdateVao(gl, buffer) {
        gl.bindVertexArray(buffer.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo)
        gl.bufferData(gl.ARRAY_BUFFER, buffer.vertices, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.indices, gl.STATIC_DRAW)
    }
    static BindAndDraw(gl, buffer) {
        gl.bindVertexArray(buffer.vao)
        gl.drawElements(gl.TRIANGLES, buffer.index_pos, gl.UNSIGNED_INT, 0)
    }
    static DrawRange(gl, start, count) {
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, start)
    }
    static UpdateAndDraw(gl, buffer) {
        if (buffer.vertex_pos == 0)
            return
        gl.bindVertexArray(buffer.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo)
        gl.bufferData(gl.ARRAY_BUFFER, buffer.vertices, gl.DYNAMIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.indices, gl.DYNAMIC_DRAW)
        gl.drawElements(gl.TRIANGLES, buffer.index_pos, gl.UNSIGNED_INT, 0)
    }
    set_orthographic(orthographic, x, y) {
        Matrix.Identity(this.mv)
        Matrix.Translate(this.mv, x, y, -1)
        Matrix.Multiply(this.mvp, orthographic, this.mv)
    }
    set_perspective(perspective, x, y, z, rx, ry) {
        Matrix.Identity(this.v)
        Matrix.RotateX(this.v, rx)
        Matrix.RotateY(this.v, ry)
        Matrix.TranslateFromView(this.mv, this.v, x, y, z)
        Matrix.Multiply(this.mvp, perspective, this.mv)
    }
    update_mvp(gl) {
        gl.uniformMatrix4fv(this.mvp_location[this.program_name], false, this.mvp)
    }
    static MakeVao(gl, buffer, position, color, texture) {
        buffer.vao = gl.createVertexArray()
        buffer.vbo = gl.createBuffer()
        buffer.ebo = gl.createBuffer()
        gl.bindVertexArray(buffer.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo)

        let stride = (position + color + texture) * 4
        let index = 0
        let offset = 0
        if (position > 0) {
            gl.vertexAttribPointer(index, position, gl.FLOAT, false, stride, offset)
            gl.enableVertexAttribArray(index)
            index++
            offset += position * 4
        }
        if (color > 0) {
            gl.vertexAttribPointer(index, color, gl.FLOAT, false, stride, offset)
            gl.enableVertexAttribArray(index)
            index++
            offset += color * 4
        }
        if (texture > 0) {
            gl.vertexAttribPointer(index, texture, gl.FLOAT, false, stride, offset)
            gl.enableVertexAttribArray(index)
        }
    }
    static UpdateFrameBuffer(gl, frame) {
        for (let i = 0; i < frame.format.length; i++) {
            gl.bindTexture(gl.TEXTURE_2D, frame.textures[i])
            gl.texImage2D(gl.TEXTURE_2D, 0, frame.internalFormat[i], frame.width, frame.height, 0, frame.format[i], frame.type[i], null)
        }
        if (frame.depth) {
            gl.bindTexture(gl.TEXTURE_2D, frame.depth_texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH24_STENCIL8, frame.width, frame.height, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null)
        }
    }
    static TextureFrameBuffer(gl, frame) {
        for (let i = 0; i < frame.format.length; i++) {
            frame.textures[i] = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, frame.textures[i])
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            if (frame.linear) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            }
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, frame.textures[i], 0)
            frame.draw_buffers[i] = gl.COLOR_ATTACHMENT0 + i
        }
        gl.drawBuffers(frame.draw_buffers)
        if (frame.depth) {
            frame.depth_texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, frame.depth_texture)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, frame.depth_texture, 0)
        }
        RenderSystem.UpdateFrameBuffer(gl, frame)
    }
    static MakeFrameBuffer(gl, frame) {
        frame.fbo = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame.fbo)
        RenderSystem.TextureFrameBuffer(gl, frame)
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            console.error("framebuffer error")
    }
    async make_program(gl, name) {
        let file = await Network.Request("shaders/" + name)
        let parts = file.split("===========================================================")
        let vertex = parts[0]
        let fragment = parts[1].trim()
        let program = RenderSystem.CompileProgram(gl, vertex, fragment)
        this.shaders[name] = program
        this.mvp_location[name] = gl.getUniformLocation(program, "u_mvp")
        this.texture_location[name] = gl.getUniformLocation(program, "u_texture0")
    }
    async make_image(gl, name, wrap) {
        let texture = gl.createTexture()
        texture.image = new Image()
        texture.image.src = "images/" + name + ".png"

        await new Promise(function (resolve) {
            texture.image.onload = resolve
        })

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
        gl.bindTexture(gl.TEXTURE_2D, null)

        this.textures[name] = texture
    }
    static CompileProgram(gl, v, f) {
        let vert = RenderSystem.CompileShader(gl, v, gl.VERTEX_SHADER)
        let frag = RenderSystem.CompileShader(gl, f, gl.FRAGMENT_SHADER)
        let program = gl.createProgram()
        gl.attachShader(program, vert)
        gl.attachShader(program, frag)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(v + ", " + f)
            console.error(gl.getProgramInfoLog(program))
        }
        return program
    }
    static CompileShader(gl, source, type) {
        let shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(source)
            console.error(gl.getShaderInfoLog(shader))
        }
        return shader
    }
}
class RenderBuffer {
    constructor() {
        this.position
        this.color
        this.texture
        this.vao
        this.vbo
        this.ebo
        this.vertex_pos
        this.index_pos
        this.index_offset
        this.vertices
        this.indices
    }
    static Init(gl, position, color, texture, vertex_limit, index_limit) {
        let buffer = new RenderBuffer()
        buffer.position = position
        buffer.color = color
        buffer.texture = texture
        buffer.vertex_pos = 0
        buffer.index_pos = 0
        buffer.index_offset = 0
        buffer.vertices = new Float32Array(vertex_limit * (position + color + texture))
        buffer.indices = new Uint32Array(index_limit)
        RenderSystem.MakeVao(gl, buffer, position, color, texture)
        return buffer
    }
    static InitCopy(gl, source) {
        let buffer = new RenderBuffer();
        buffer.vertices = new Float32Array(source.vertex_pos)
        buffer.indices = new Uint32Array(source.index_pos)
        RenderBuffer.Copy(source, buffer)
        RenderSystem.MakeVao(gl, buffer, source.position, source.color, source.texture)
        RenderSystem.UpdateVao(gl, buffer)
        return buffer
    }
    static Copy(from, to) {
        for (let i = 0; i < from.vertex_pos; i++) to.vertices[i] = from.vertices[i]
        for (let i = 0; i < from.index_pos; i++) to.indices[i] = from.indices[i]

        to.vertex_pos = from.vertex_pos
        to.index_pos = from.index_pos
        to.index_offset = from.index_offset
    }
    static Expand(gl, buffer) {
        let vertices = buffer.vertices
        let indices = buffer.vertices

        buffer.vertices = new Float32Array(buffer.vertices.length * 2)
        buffer.indices = new Uint32Array(buffer.indices.length * 2)

        for (let i = 0; i < buffer.vertex_pos; i++) buffer.vertices[i] = vertices[i]
        for (let i = 0; i < buffer.index_pos; i++) buffer.indices[i] = indices[i]

        RenderSystem.UpdateVao(gl, buffer)

        return buffer
    }
    Zero() {
        this.vertex_pos = 0
        this.index_pos = 0
        this.index_offset = 0
    }
}
class RenderCopy {
    constructor(position, color, texture, vertex_limit, index_limit) {
        this.position = position
        this.color = color
        this.texture = texture
        this.vertex_pos
        this.index_pos
        this.index_offset
        this.vertices = new Float32Array(vertex_limit * (position + color + texture))
        this.indices = new Uint32Array(index_limit)
    }
    Zero() {
        this.vertex_pos = 0
        this.index_pos = 0
        this.index_offset = 0
    }
}
class FrameBuffer {
    constructor() {
        this.fbo
        this.internalFormat
        this.format
        this.type
        this.width
        this.height
        this.linear
        this.depth
        this.depth_texture
        this.textures = []
        this.draw_buffers = []
    }
    set(width, height, internalFormat, format, type, linear, depth) {
        if (format.length !== internalFormat.length || format.length !== type.length) {
            console.error("framebuffer invalid")
        }
        this.internalFormat = internalFormat
        this.format = format
        this.type = type
        this.width = width
        this.height = height
        this.linear = linear === "linear"
        this.depth = depth === "depth"
    }
    static Make(gl, width, height, internalFormat, format, type, linear, depth) {
        let frame = new FrameBuffer()
        frame.set(width, height, internalFormat, format, type, linear, depth)
        RenderSystem.MakeFrameBuffer(gl, frame)
        return frame
    }
    static Resize(gl, frame, width, height) {
        frame.width = width
        frame.height = height
        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.UpdateFrameBuffer(gl, frame)
    }
}
const INPUT_KEYS = {}
const INPUT_MOUSE = [false, false]
const INPUT_POS = [0, 0]

class Input {
    static Is(key) {
        return INPUT_KEYS[key]
    }
    static Off(key) {
        INPUT_KEYS[key] = false
    }
    static IsClick(id) {
        return INPUT_MOUSE[id]
    }
    static MovementY() {
        return INPUT_MOVEMENT[1]
    }
    static Moved() {
        INPUT_MOVEMENT[0] = 0
        INPUT_MOVEMENT[1] = 0
    }
    static Clicked(id) {
        INPUT_MOUSE[id] = false
    }
    static KeyUp(event) {
        INPUT_KEYS[event.key] = false
    }
    static KeyDown(event) {
        INPUT_KEYS[event.key] = true
    }
    static MouseUp(event) {
        if (event.button === 0) INPUT_MOUSE[0] = false
        else if (event.button === 2) INPUT_MOUSE[1] = false
    }
    static MouseDown(event) {
        if (event.button === 0) INPUT_MOUSE[0] = true
        else if (event.button === 2) INPUT_MOUSE[1] = true
    }
    static MouseMove(event) {
        INPUT_POS[0] = event.clientX
        INPUT_POS[1] = event.clientY
    }
}const Sounds = {}
const ImageData = {}
const SpriteData = {}
const SpriteAlias = {}
const SpriteAnimations = {}
const DirectionPrefix = ["front-", "front-side-", "side-", "back-side-", "back-"]

class Wad {
    static async Load(g, gl, string) {
        let wad = Parser.read(string)

        console.log(wad)

        let resources = wad["resources"]
        let sprites = wad["sprites"]
        let animations = wad["animations"]
        let tiles = wad["tiles"]
        let shaders = resources["shaders"]
        let textures = resources["images"]
        let sounds = resources["sounds"]

        let promises = []

        for (let index = 0; index < shaders.length; index++)
            promises.push(g.make_program(gl, shaders[index]))

        for (let index = 0; index < textures.length; index++)
            promises.push(g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE))

        await Promise.all(promises)

        for (let s in sounds) {
            let name = sounds[s]
            let key = name.substring(0, name.lastIndexOf("."))
            Sounds[key] = new Audio("sounds/" + name)
        }
        for (let name in sprites) {
            let sprite = sprites[name]

            let texture = g.textures[name]
            let width = 1.0 / texture.image.width
            let height = 1.0 / texture.image.height

            ImageData[name] = {}
            SpriteData[name] = {}

            for (let frame in sprite) {
                let data = sprite[frame]
                let atlas = []
                for (let i in data)
                    atlas.push(parseInt(data[i]))
                ImageData[name][frame] = Sprite.Build(atlas, width, height)
                SpriteData[name][frame] = Sprite.Build3(atlas, width, height)
            }
        }

        for (let name in animations) {
            let animation = animations[name]
            let animation_list = animation["animations"]
            let alias = ("alias" in animation) ? animation["alias"] : null

            SpriteAlias[name] = {}
            SpriteAnimations[name] = {}

            for (let key in animation_list)
                SpriteAnimations[name][key] = animation_list[key]

            if (alias != null) {
                for (let key in alias)
                    SpriteAlias[name][key] = alias[key]
            }
        }

        TileTexture.push(null)
        TileClosed.push(false)
        let tile_sprites = sprites["tiles"]
        let texture = g.textures["tiles"]
        let width = 1.0 / texture.image.width
        let height = 1.0 / texture.image.height
        for (let name in tile_sprites) {
            let data = tile_sprites[name]
            let x = parseInt(data[0])
            let y = parseInt(data[1])
            let w = parseInt(data[2])
            let h = parseInt(data[3])
            TileTexture.push(Sprite.Simple(x, y, w, h, width, height))
            TileClosed.push(tiles[name]["closed"] === "true")
        }

        Wad.SpriteBuilderDirectional("baron", BaronAnimationIdle, "idle")
        Wad.SpriteBuilderDirectional("baron", BaronAnimationWalk, "walk")
        Wad.SpriteBuilderDirectional("baron", BaronAnimationMelee, "melee")
        Wad.SpriteBuilderDirectional("baron", BaronAnimationMissile, "missile")
        Wad.SpriteBuilderDirectional("baron", BaronAnimationDeath, "death")

        HumanAnimationIdle.push.apply(HumanAnimationIdle, BaronAnimationIdle)
        HumanAnimationWalk.push.apply(HumanAnimationWalk, BaronAnimationWalk)
        HumanAnimationMelee.push.apply(HumanAnimationMelee, BaronAnimationMelee)
        HumanAnimationMissile.push.apply(HumanAnimationMissile, BaronAnimationMissile)
        HumanAnimationDeath.push.apply(HumanAnimationDeath, BaronAnimationDeath)

        Wad.SpriteBuilder("particles", PlasmaExplosionAnimation, "plasma-explosion")
    }
    static SpriteBuilder(sid, array, name) {
        let animation = []
        let animationData = SpriteAnimations[sid][name]
        for (let a in animationData) {
            let name = animationData[a]
            animation.push(SpriteData[sid][name])
        }
        array.push.apply(array, animation)
    }
    static SpriteBuilderDirectional(sid, array, name) {
        let animation = []
        let animationData = SpriteAnimations[sid][name]
        for (let a in animationData) {
            let name = animationData[a]
            let slice = new Array(5)
            for (let d in DirectionPrefix) {
                let direction = DirectionPrefix[d]
                let fullname = direction + name
                let sprite = SpriteData[sid]["front-" + name]
                if (fullname in SpriteData[sid]) {
                    sprite = SpriteData[sid][fullname]
                }
                slice[d] = sprite
            }
            animation.push(slice)
        }
        array.push.apply(array, animation)
    }
}
class Camera {
    constructor(thing, radius, rx, ry) {
        this.thing = thing
        this.radius = radius
        this.x = 0
        this.y = 0
        this.z = 0
        this.rx = rx
        this.ry = ry
        this.update()
    }
    update() {
        if (Input.Is("ArrowLeft")) {
            this.ry -= 0.05
            if (this.ry < 0)
                this.ry += Tau
        }

        if (Input.Is("ArrowRight")) {
            this.ry += 0.05
            if (this.ry >= Tau)
                this.ry -= Tau
        }

        if (this.rx > -0.25 && Input.Is("ArrowUp"))
            this.rx -= 0.05

        if (this.rx < 0.25 && Input.Is("ArrowDown"))
            this.rx += 0.05

        let sinX = Math.sin(this.rx)
        let cosX = Math.cos(this.rx)
        let sinY = Math.sin(this.ry)
        let cosY = Math.cos(this.ry)

        let thing = this.thing

        this.x = thing.X - this.radius * cosX * sinY
        this.y = thing.Y + this.radius * sinX
        this.z = thing.Z + this.radius * cosX * cosY

        this.y += thing.Height
    }
}
const LIGHT_QUEUE_LIMIT = 30 * 30 * 30
const LIGHT_QUEUE = new Array(LIGHT_QUEUE_LIMIT)
const LIGHT_QUEUE_POS = 0
const LIGHT_QUEUE_NUM = 1
const LIGHT_FADE = 0.95
for (let i = 0; i < LIGHT_QUEUE.length; i++) {
    LIGHT_QUEUE[i] = new Int32Array(3)
}
let LIGHT_BLOCK_X = 0
let LIGHT_BLOCK_Y = 0
let LIGHT_BLOCK_Z = 0
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
        let tile = world.GetTilePointer(LIGHT_BLOCK_X, LIGHT_BLOCK_Y, LIGHT_BLOCK_Z, bx, by, bz)
        if (tile === null || TileClosed[tile.type])
            return
        if (tile.red >= red || tile.green >= green || tile.blue >= blue)
            return
        tile.red = red
        tile.green = green
        tile.blue = blue

        let queue = LIGHT_POS + LIGHT_NUM
        if (queue >= LIGHT_QUEUE_LIMIT)
            queue -= LIGHT_QUEUE_LIMIT
        LIGHT_QUEUE[queue][0] = bx
        LIGHT_QUEUE[queue][1] = by
        LIGHT_QUEUE[queue][2] = bz
        LIGHT_NUM++
    }
    static Add(world, block, light) {
        LIGHT_BLOCK_X = block.x
        LIGHT_BLOCK_Y = block.y
        LIGHT_BLOCK_Z = block.z

        let color = Render.UnpackRgb(light.rgb)

        let index = light.x + light.y * BlockSize + light.z * BLOCK_SLICE
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
            if (LIGHT_POS === LIGHT_QUEUE_LIMIT)
                LIGHT_POS = 0
            LIGHT_NUM--

            let node = world.GetTilePointer(LIGHT_BLOCK_X, LIGHT_BLOCK_Y, LIGHT_BLOCK_Z, x, y, z)
            if (node === null)
                continue

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
        let cx = Math.floor(x * InverseBlockSize)
        let cy = Math.floor(y * InverseBlockSize)
        let cz = Math.floor(z * InverseBlockSize)
        let bx = x % BlockSize
        let by = y % BlockSize
        let bz = z % BlockSize
        let block = world.blocks[cx + cy * world.width + cz * world.slice]
        for (let i = 0; i < block.lights.length; i++) {
            let light = block.lights[i]
            if (light.x === bx && light.y === by && light.z === bz)
                block.lights.splice(i, 1)
        }
    }
}
class Render {
    static Lumin(rgb) {
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
    }
    static PackRgb(red, green, blue) {
        return (red << 16) | (green << 8) | blue
    }
    static UnpackRgb(rgb) {
        let red = (rgb >> 16) & 255
        let green = (rgb >> 8) & 255
        let blue = rgb & 255
        return [red, green, blue]
    }
    static Index4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3
        buffer.indices[buffer.index_pos++] = buffer.index_offset
        buffer.index_offset += 4
    }
    static MirrorIndex4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3
        buffer.indices[buffer.index_pos++] = buffer.index_offset
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
        buffer.index_offset += 4
    }
    static Image(buffer, x, y, width, height, left, top, right, bottom) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = left
        buffer.vertices[buffer.vertex_pos++] = bottom

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = right
        buffer.vertices[buffer.vertex_pos++] = bottom

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = right
        buffer.vertices[buffer.vertex_pos++] = top

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = left
        buffer.vertices[buffer.vertex_pos++] = top

        Render.Index4(buffer)
    }
    static Rectangle(buffer, x, y, width, height, red, green, blue) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        Render.Index4(buffer)
    }
    static Circle(buffer, x, y, radius, red, green, blue) {
        const points = 32
        const tau = Math.PI * 2.0
        const slice = tau / points

        let firstIndex = buffer.index_offset
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue
        buffer.index_offset++

        let radian = 0
        while (radian < tau) {
            buffer.vertices[buffer.vertex_pos++] = x + Math.cos(radian) * radius
            buffer.vertices[buffer.vertex_pos++] = y + Math.sin(radian) * radius
            buffer.vertices[buffer.vertex_pos++] = red
            buffer.vertices[buffer.vertex_pos++] = green
            buffer.vertices[buffer.vertex_pos++] = blue

            buffer.indices[buffer.index_pos++] = firstIndex
            buffer.indices[buffer.index_pos++] = buffer.index_offset
            buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
            buffer.index_offset++

            radian += slice
        }
        buffer.indices[buffer.index_pos - 1] = firstIndex + 1
    }
}
class Render3 {
    static Sprite(buffer, x, y, z, sin, cos, sprite) {
        let sine = sprite.half_width * sin;
        let cosine = sprite.half_width * cos;

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        Render.Index4(buffer)
    }
    static MirrorSprite(buffer, x, y, z, sin, cos, sprite) {
        let sine = sprite.half_width * sin;
        let cosine = sprite.half_width * cos;

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        Render.Index4(buffer)
    }
    static Sprite3(buffer, x, y, z, mv, sprite) {
        let right0 = mv[0]
        let right1 = mv[4]
        let right2 = mv[8]

        let up0 = mv[1]
        let up1 = mv[5]
        let up2 = mv[9]

        let rpu_x = right0 * sprite.width + up0 * sprite.height
        let rpu_y = right1 * sprite.width + up1 * sprite.height
        let rpu_z = right2 * sprite.width + up2 * sprite.height

        let rmu_x = right0 * sprite.width - up0 * sprite.height
        let rmu_y = right1 * sprite.width - up1 * sprite.height
        let rmu_z = right2 * sprite.width - up2 * sprite.height

        buffer.vertices[buffer.vertex_pos++] = x - rmu_x
        buffer.vertices[buffer.vertex_pos++] = y - rmu_y
        buffer.vertices[buffer.vertex_pos++] = z - rmu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x - rpu_x
        buffer.vertices[buffer.vertex_pos++] = y - rpu_y
        buffer.vertices[buffer.vertex_pos++] = z - rpu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + rmu_x
        buffer.vertices[buffer.vertex_pos++] = y + rmu_y
        buffer.vertices[buffer.vertex_pos++] = z + rmu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + rpu_x
        buffer.vertices[buffer.vertex_pos++] = y + rpu_y
        buffer.vertices[buffer.vertex_pos++] = z + rpu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        Render.Index4(buffer)
    }
}
class RenderTile {
	static Side(buffer, side, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d) {
		switch (side) {
			case WorldPositiveX:
				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]
				break
			case WorldNegativeX:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
			case WorldPositiveY:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
			case WorldNegativeY:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]
				break
			case WorldPositiveZ:
				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
			case WorldNegativeZ:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
		}

		if (Render.Lumin(rgb_a) + Render.Lumin(rgb_c) < Render.Lumin(rgb_b) + Render.Lumin(rgb_d))
			Render.MirrorIndex4(buffer)
		else
			Render.Index4(buffer)
	}
}
const Gravity = 0.01

const AnimationRate = 16

const AnimationNotDone = 0
const AnimationAlmostDone = 1
const AnimationDone = 2

const AnimationFront = 0
const AnimationFrontSide = 1
const AnimationSide = 2
const AnimationBackSide = 3
const AnimationBack = 4

const DirectionNorth = 0
const DirectionNorthEast = 1
const DirectionEast = 2
const DirectionSouthEast = 3
const DirectionSouth = 4
const DirectionSouthWest = 5
const DirectionWest = 6
const DirectionNorthWest = 7
const DirectionCount = 8
const DirectionNone = 8

const DirectionToAngle = [
    0.0 * DegToRad,
    45.0 * DegToRad,
    90.0 * DegToRad,
    135.0 * DegToRad,
    180.0 * DegToRad,
    225.0 * DegToRad,
    270.0 * DegToRad,
    315.0 * DegToRad
]

const ThingAngleA = 337.5 * DegToRad
const ThingAngleB = 292.5 * DegToRad
const ThingAngleC = 247.5 * DegToRad
const ThingAngleD = 202.5 * DegToRad
const ThingAngleE = 157.5 * DegToRad
const ThingAngleF = 112.5 * DegToRad
const ThingAngleG = 67.5 * DegToRad
const ThingAngleH = 22.5 * DegToRad

const HumanUID = 0
const BaronUID = 1
const TreeUID = 2
const PlasmaUID = 3

class Thing {
    constructor() {
        this.World = null
        this.UID = 0
        this.SID = ""
        this.NID = 0
        this.Animation = null
        this.AnimationMod = 0
        this.AnimationFrame = 0
        this.X = 0
        this.Y = 0
        this.Z = 0
        this.Angle = 0
        this.DeltaX = 0
        this.DeltaY = 0
        this.DeltaZ = 0
        this.OldX = 0
        this.OldY = 0
        this.OldZ = 0
        this.NetX = 0
        this.NetY = 0
        this.NetZ = 0
        this.DeltaNetX = 0
        this.DeltaNetY = 0
        this.DeltaNetZ = 0
        this.MinBX = 0
        this.MinBY = 0
        this.MinBZ = 0
        this.MaxBX = 0
        this.MaxBY = 0
        this.MaxBZ = 0
        this.Ground = false
        this.Radius = 0
        this.Height = 0
        this.Speed = 0
        this.Health = 0
    }
    BlockBorders() {
        this.MinBX = Math.floor((this.X - this.Radius) * InverseBlockSize)
        this.MinBY = Math.floor(this.Y * InverseBlockSize)
        this.MinBZ = Math.floor((this.Z - this.Radius) * InverseBlockSize)
        this.MaxBX = Math.floor((this.X + this.Radius) * InverseBlockSize)
        this.MaxBY = Math.floor((this.Y + this.Height) * InverseBlockSize)
        this.MaxBZ = Math.floor((this.Z + this.Radius) * InverseBlockSize)
    }
    AddToBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).AddThing(this)
                }
            }
        }
    }
    RemoveFromBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).RemoveThing(this)
                }
            }
        }
    }
    Cleanup() {
        this.World.RemoveThing(this)
        this.RemoveFromBlocks()
    }
    UpdateAnimation() {
        this.AnimationMod++
        if (this.AnimationMod === AnimationRate) {
            this.AnimationMod = 0
            this.AnimationFrame++
            let len = this.Animation.length
            if (this.AnimationFrame === len - 1)
                return AnimationAlmostDone
            else if (this.AnimationFrame === len)
                return AnimationDone
        }
        return AnimationNotDone
    }
    NetUpdateState(_) {}
    NetUpdateHealth(_) {}
    TerrainCollisionY(world) {
        if (this.DeltaY < 0) {
            let gx = Math.floor(this.X)
            let gy = Math.floor(this.Y)
            let gz = Math.floor(this.Z)
            let bx = Math.floor(gx * InverseBlockSize)
            let by = Math.floor(gy * InverseBlockSize)
            let bz = Math.floor(gz * InverseBlockSize)
            let tx = gx - bx * BlockSize
            let ty = gy - by * BlockSize
            let tz = gz - bz * BlockSize

            let tile = world.GetTileType(bx, by, bz, tx, ty, tz)
            if (TileClosed[tile]) {
                this.Y = gy + 1
                this.Ground = true
                this.DeltaY = 0
            }
        }
    }
    Resolve(b) {
        let square = this.Radius + b.Radius
        if (Math.abs(this.X - b.X) > square || Math.abs(this.Z - b.Z) > square)
            return
        if (Math.abs(this.OldX - b.X) > Math.abs(this.OldZ - b.Z)) {
            if (this.OldX - b.X < 0) this.X = b.X - square
            else this.X = b.X + square
            this.DeltaX = 0.0
        } else {
            if (this.OldZ - b.Z < 0) this.Z = b.Z - square
            else this.Z = b.Z + square
            this.DeltaZ = 0.0
        }
    }
    Overlap(b) {
        let square = this.Radius + b.Radius
        return Math.abs(this.X - b.X) <= square && Math.abs(this.Z - b.Z) <= square
    }
    LerpNetCode() {
        let updateBlocks = false

        if (this.DeltaNetX > 0) {
            this.X += this.DeltaNetX
            updateBlocks = true
            if (this.X >= this.NetX) {
                this.X = this.NetX
                this.DeltaNetX = 0
            }
        } else if (this.DeltaNetX < 0) {
            this.X += this.DeltaNetX
            updateBlocks = true
            if (this.X <= this.NetX) {
                this.X = this.NetX
                this.DeltaNetX = 0
            }
        }

        if (this.DeltaNetY > 0) {
            this.Y += this.DeltaNetY
            updateBlocks = true
            if (this.Y >= this.NetY) {
                this.Y = this.NetY
                this.DeltaNetY = 0
            }
        } else if (this.DeltaNetY < 0) {
            this.Y += this.DeltaNetY
            updateBlocks = true
            if (this.Y <= this.NetY) {
                this.Y = this.NetY
                this.DeltaNetY = 0
            }
        }

        if (this.DeltaNetZ > 0) {
            this.Z += this.DeltaNetZ
            updateBlocks = true
            if (this.Z >= this.NetZ) {
                this.Z = this.NetZ
                this.DeltaNetZ = 0
            }
        } else if (this.DeltaNetZ < 0) {
            this.Z += this.DeltaNetZ
            updateBlocks = true
            if (this.Z <= this.NetZ) {
                this.Z = this.NetZ
                this.DeltaNetZ = 0
            }
        }

        if (updateBlocks) {
            this.RemoveFromBlocks()
            this.BlockBorders()
            this.AddToBlocks()
        }
    }
    Integrate() {
        // OldX and snapshot need to be different things

        // this.OldX = this.X
        // this.OldY = this.Y
        // this.OldZ = this.Z

        // if (this.DeltaX != 0.0 || this.DeltaZ != 0.0) {
        //     this.X += this.DeltaX
        //     this.Z += this.DeltaZ

        //     let collided = []
        //     let searched = new Set()

        //     this.RemoveFromBlocks(world)

        //     for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
        //         for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
        //             for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
        //                 let block = world.GetBlock(gx, gy, gz)
        //                 for (let t = 0; t < block.thingCount; t++) {
        //                     let thing = block.things[t]
        //                     if (searched.has(thing)) continue
        //                     searched.add(thing)
        //                     if (this.Overlap(thing)) collided.push(thing)
        //                 }
        //             }
        //         }
        //     }

        //     while (collided.length > 0) {
        //         let closest = null
        //         let manhattan = Number.MAX_VALUE
        //         for (let i = 0; i < collided.length; i++) {
        //             let thing = collided[i]
        //             let dist = Math.abs(this.OldX - thing.X) + Math.abs(this.OldZ - thing.Z)
        //             if (dist < manhattan) {
        //                 manhattan = dist
        //                 closest = thing
        //             }
        //         }
        //         this.Resolve(closest)
        //         collided.splice(closest)
        //     }

        //     this.BlockBorders()
        //     this.AddToBlocks(world)

        //     this.DeltaX = 0.0
        //     this.DeltaZ = 0.0
        // }

        // if (!this.Ground || this.DeltaY != 0.0) {
        //     this.DeltaY -= GRAVITY
        //     this.Y += this.DeltaY
        //     this.TerrainCollisionY(world)

        //     this.RemoveFromBlocks(world)
        //     this.BlockBorders()
        //     this.AddToBlocks(world)
        // }
    }
    Render(spriteBuffer, camX, camZ, camAngle) {
        let sin = camX - this.X
        let cos = camZ - this.Z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length

        let angle = camAngle - this.Angle
        if (angle < 0) angle += Tau

        let direction
        let mirror

        if (angle > ThingAngleA) {
            direction = AnimationBack
            mirror = false
        } else if (angle > ThingAngleB) {
            direction = AnimationBackSide
            mirror = true
        } else if (angle > ThingAngleC) {
            direction = AnimationSide
            mirror = true
        } else if (angle > ThingAngleD) {
            direction = AnimationFrontSide
            mirror = true
        } else if (angle > ThingAngleE) {
            direction = AnimationFront
            mirror = false
        } else if (angle > ThingAngleF) {
            direction = AnimationFrontSide
            mirror = false
        } else if (angle > ThingAngleG) {
            direction = AnimationSide
            mirror = false
        } else if (angle > ThingAngleH) {
            direction = AnimationBackSide
            mirror = false
        } else {
            direction = AnimationBack
            mirror = false
        }

        let sprite = this.Animation[this.AnimationFrame][direction]

        if (mirror) Render3.MirrorSprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, sprite)
        else Render3.Sprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, sprite)
    }
}
class Tree extends Thing {
    constructor(world, nid, x, y, z) {
        super()
        this.World = world
        this.UID = TreeUID
        this.SID = "scenery"
        this.NID = nid
        this.Sprite = SpriteData[this.SID]["dead-tree"]
        this.X = x
        this.Y = y
        this.Z = z
        this.OldX = x
        this.OldY = y
        this.OldZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = 1
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    Update() {}
    Render(spriteBuffer, camX, camZ, camAngle) {
        let sin = camX - this.X
        let cos = camZ - this.Z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length
        Render3.Sprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, this.Sprite)
    }
}
class Item {
    constructor() {
        this.World = null
        this.UID = 0
        this.SID = ""
        this.NID = 0
        this.Sprite = null
        this.X = 0
        this.Y = 0
        this.Z = 0
        this.DeltaX = 0
        this.DeltaY = 0
        this.DeltaZ = 0
        this.MinBX = 0
        this.MinBY = 0
        this.MinBZ = 0
        this.MaxBX = 0
        this.MaxBY = 0
        this.MaxBZ = 0
        this.Radius = 0
        this.Height = 0
    }
}

class Medkit extends Item {

}
class Missile {
    constructor() {
        this.World = null
        this.UID = 0
        this.SID = ""
        this.NID = 0
        this.Sprite = null
        this.X = 0
        this.Y = 0
        this.Z = 0
        this.DeltaX = 0
        this.DeltaY = 0
        this.DeltaZ = 0
        this.MinBX = 0
        this.MinBY = 0
        this.MinBZ = 0
        this.MaxBX = 0
        this.MaxBY = 0
        this.MaxBZ = 0
        this.Radius = 0
        this.Height = 0
    }
    BlockBorders() {
        this.MinBX = Math.floor((this.X - this.Radius) * InverseBlockSize)
        this.MinBY = Math.floor(this.Y * InverseBlockSize)
        this.MinBZ = Math.floor((this.Z - this.Radius) * InverseBlockSize)
        this.MaxBX = Math.floor((this.X + this.Radius) * InverseBlockSize)
        this.MaxBY = Math.floor((this.Y + this.Height) * InverseBlockSize)
        this.MaxBZ = Math.floor((this.Z + this.Radius) * InverseBlockSize)
    }
    AddToBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    let block = this.World.GetBlock(gx, gy, gz)
                    if (block === null) {
                        this.RemoveFromBlocks()
                        return true
                    }
                    block.AddMissile(this)
                }
            }
        }
        return false
    }
    RemoveFromBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    let block = this.World.GetBlock(gx, gy, gz)
                    if (block !== null)
                        block.RemoveMissile(this)
                }
            }
        }
    }
    Cleanup() {
        this.World.RemoveMissile(this)
        this.RemoveFromBlocks()
    }
    Update() {
        this.RemoveFromBlocks()
        this.X += this.DeltaX
        this.Y += this.DeltaY
        this.Z += this.DeltaZ
        this.BlockBorders()
        if (this.AddToBlocks())
            return true
        return false
    }
    Render(spriteBuffer, camX, camZ, camAngle) {
        let sin = camX - this.X
        let cos = camZ - this.Z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length
        Render3.Sprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, this.Sprite)
    }
}

class Plasma extends Missile {
    constructor(world, nid, damage, x, y, z, dx, dy, dz) {
        super()
        this.World = world
        this.X = x
        this.Y = y
        this.Z = z
        this.BlockBorders()
        if (this.AddToBlocks())
            return this
        this.UID = PlasmaUID
        this.SID = "missiles"
        this.NID = nid
        this.Sprite = SpriteData[this.SID]["baron-missile-front-1"]
        this.DeltaX = dx * InverseNetRate
        this.DeltaY = dy * InverseNetRate
        this.DeltaZ = dz * InverseNetRate
        this.Radius = 0.2
        this.Height = 0.2
        this.DamageAmount = damage
        this.Hit = this.PlasmaHit
        world.AddMissile(this)
        return this
    }
    Cleanup() {
        super.Cleanup()
        PlaySound("plasma-impact")
        new PlasmaExplosion(this.World, this.X, this.Y, this.Z)
    }
}
const PlasmaExplosionAnimation = []

class Particle {
    constructor() {
        this.World = null
        this.SID = ""
        this.Sprite = null
        this.X = 0
        this.Y = 0
        this.Z = 0
        this.DeltaX = 0
        this.DeltaY = 0
        this.DeltaZ = 0
        this.MinBX = 0
        this.MinBY = 0
        this.MinBZ = 0
        this.MaxBX = 0
        this.MaxBY = 0
        this.MaxBZ = 0
        this.Radius = 0
        this.Height = 0
    }
    BlockBorders() {
        this.MinBX = Math.floor((this.X - this.Radius) * InverseBlockSize)
        this.MinBY = Math.floor(this.Y * InverseBlockSize)
        this.MinBZ = Math.floor((this.Z - this.Radius) * InverseBlockSize)
        this.MaxBX = Math.floor((this.X + this.Radius) * InverseBlockSize)
        this.MaxBY = Math.floor((this.Y + this.Height) * InverseBlockSize)
        this.MaxBZ = Math.floor((this.Z + this.Radius) * InverseBlockSize)
    }
    AddToBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).AddParticle(this)
                }
            }
        }
    }
    RemoveFromBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).RemoveParticle(this)
                }
            }
        }
    }
    Collision() {
        let minGX = Math.floor(this.X - this.Radius)
        let minGY = Math.floor(this.Y)
        let minGZ = Math.floor(this.Z - this.Radius)
        let maxGX = Math.floor(this.X + this.Radius)
        let maxGY = Math.floor(this.Y + this.Height)
        let maxGZ = Math.floor(this.Z + this.Radius)
        for (let gx = minGX; gx <= maxGX; gx++) {
            for (let gy = minGY; gy <= maxGY; gy++) {
                for (let gz = minGZ; gz <= maxGZ; gz++) {
                    let bx = Math.floor(gx * InverseBlockSize)
                    let by = Math.floor(gy * InverseBlockSize)
                    let bz = Math.floor(gz * InverseBlockSize)
                    let tx = gx - bx * BlockSize
                    let ty = gy - by * BlockSize
                    let tz = gz - bz * BlockSize
                    let tile = this.World.GetTileType(bx, by, bz, tx, ty, tz)
                    if (TileClosed[tile]) {
                        return true
                    }
                }
            }
        }
        return false
    }
    Update() {}
    Render(spriteBuffer, camX, camZ) {
        let sin = camX - this.X
        let cos = camZ - this.Z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length
        Render3.Sprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, this.Sprite)
    }
}

class PlasmaExplosion extends Particle {
    constructor(world, x, y, z) {
        super()
        this.SID = "particles"
        this.AnimationMod = 0
        this.AnimationFrame = 0
        this.Animation = PlasmaExplosionAnimation
        this.Sprite = this.Animation[0]
        this.World = world
        this.X = x
        this.Y = y
        this.Z = z
        this.DeltaX = 0
        this.DeltaY = 0
        this.DeltaZ = 0
        this.Radius = 0.4
        this.Height = 1.0
        world.AddParticle(this)
        this.BlockBorders()
        this.AddToBlocks()
        return this
    }
    UpdateAnimation() {
        const PlasmaAnimationRate = 8
        this.AnimationMod++
        if (this.AnimationMod === PlasmaAnimationRate) {
            this.AnimationMod = 0
            this.AnimationFrame++
            let len = this.Animation.length
            if (this.AnimationFrame === len - 1)
                return AnimationAlmostDone
            else if (this.AnimationFrame === len)
                return AnimationDone
        }
        return AnimationNotDone
    }
    Update() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.RemoveFromBlocks()
            return true
        }
        this.Sprite = this.Animation[this.AnimationFrame]
        return false
    }
}

class Blood extends Particle {
    constructor(world, x, y, z, dx, dy, dz, spriteName) {
        super()
        this.SID = "particles"
        this.Sprite = SpriteData[this.SID][spriteName]
        this.World = world
        this.X = x
        this.Y = y
        this.Z = z
        this.DeltaX = dx
        this.DeltaY = dy
        this.DeltaZ = dz
        this.Radius = 0.2
        this.Height = 0.2
        world.AddParticle(this)
        this.BlockBorders()
        this.AddToBlocks()
        return this
    }
    Update() {
        this.DeltaX *= 0.95
        this.DeltaY -= 0.01
        this.DeltaZ *= 0.95

        this.X += this.DeltaX
        this.Y += this.DeltaY
        this.Z += this.DeltaZ

        if (this.Collision()) {
            this.RemoveFromBlocks()
            return true
        }

        this.RemoveFromBlocks()
        this.BlockBorders()
        this.AddToBlocks()

        return false
    }
}
const HumanAnimationIdle = []
const HumanAnimationWalk = []
const HumanAnimationMelee = []
const HumanAnimationMissile = []
const HumanAnimationDeath = []

const HumanDead = 0
const HumanIdle = 1
const HumanWalk = 2
const HumanMelee = 3
const HumanMissile = 4

class Human extends Thing {
    constructor(world, nid, x, y, z, angle, health, status) {
        super()
        this.World = world
        this.UID = HumanUID
        this.SID = "baron"
        this.NID = nid
        this.Animation = HumanAnimationWalk
        this.X = x
        this.Y = y
        this.Z = z
        this.Angle = angle
        this.OldX = x
        this.OldY = y
        this.OldZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = health
        this.Status = status
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    NetUpdateState(status) {
        if (this.Status === status)
            return
        console.log("human new status", status)
        this.AnimationMod = 0
        this.AnimationFrame = 0
        switch (status) {
            case HumanDead:
                this.Animation = HumanAnimationDeath
                break
            case HumanMissile:
                this.Animation = HumanAnimationMissile
                PlaySound("baron-missile")
                console.log("baron-missile")
                break
            case HumanIdle:
                this.Animation = HumanAnimationIdle
            default:
                this.Animation = HumanAnimationWalk
                break
        }
        this.Status = status
    }
    NetUpdateHealth(health) {
        if (health < this.Health) {
            if (health < 1) {
                PlaySound("baron-death")
            } else {
                PlaySound("baron-pain")
            }
            for (let i = 0; i < 20; i++) {
                let spriteName = "blood-" + Math.floor(Math.random() * 3)
                let x = this.X + this.Radius * (1 - Math.random() * 2)
                let y = this.Y + this.Height * Math.random()
                let z = this.Z + this.Radius * (1 - Math.random() * 2)
                const spread = 0.2
                let dx = spread * (1 - Math.random() * 2)
                let dy = spread * Math.random()
                let dz = spread * (1 - Math.random() * 2)
                new Blood(this.World, x, y, z, dx, dy, dz, spriteName)
            }
        }
        this.Health = health
    }
    Dead() {
        if (this.AnimationFrame === this.Animation.length - 1) {
            this.Update = this.EmptyUpdate
        } else {
            this.UpdateAnimation()
        }
    }
    Missile() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
            this.Animation = HumanAnimationIdle
            this.Status = HumanIdle
        }
    }
    Walk() {
        if (this.UpdateAnimation() === AnimationDone)
            this.AnimationFrame = 0
    }
    Update() {
        switch (this.Status) {
            case HumanDead:
                this.Dead()
            case HumanMissile:
                this.Missile()
                break
            case HumanIdle:
                break
            default:
                this.Walk()
                break
        }
        this.LerpNetCode()
    }
    EmptyUpdate() {}
}
const InputOpNewMove = 0
const InputOpContinueMove = 1
const InputOpMissile = 2

class You extends Human {
    constructor(world, nid, x, y, z, angle, health, status) {
        super(world, nid, x, y, z, angle, health, status)
        this.camera = null
    }
    Walk() {
        let direction = null
        let goal = null

        // TODO filter input into map to reduce uploaded traffic

        if (Input.Is(" ")) {
            SocketSend.setUint8(SocketSendIndex, InputOpMissile, true)
            SocketSendIndex++
            SocketSendOperations++

            // this.Status = HumanMissile
            // this.AnimationMod = 0
            // this.AnimationFrame = 0
            // this.Animation = HumanAnimationMissile

            // PlaySound("baron-missile")
            return
        }

        if (Input.Is("w")) {
            direction = "w"
            goal = this.camera.ry
        }

        if (Input.Is("s")) {
            if (direction === null) {
                direction = "s"
                goal = this.camera.ry + Math.PI
            } else {
                direction = null
                goal = null
            }
        }

        if (Input.Is("a")) {
            if (direction === null) {
                direction = "a"
                goal = this.camera.ry - HalfPi
            } else if (direction === "w") {
                direction = "wa"
                goal -= QuarterPi
            } else if (direction === "s") {
                direction = "sa"
                goal += QuarterPi
            }
        }

        if (Input.Is("d")) {
            if (direction === null)
                goal = this.camera.ry + HalfPi
            else if (direction === "a")
                goal = null
            else if (direction === "wa")
                goal = this.camera.ry
            else if (direction === "sa")
                goal = this.camera.ry + Math.PI
            else if (direction === "w")
                goal += QuarterPi
            else if (direction === "s")
                goal -= QuarterPi
        }

        if (goal === null) {
            this.AnimationMod = 0
            this.AnimationFrame = 0
            this.Animation = HumanAnimationIdle
        } else {
            if (goal < 0)
                goal += Tau
            else if (goal >= Tau)
                goal -= Tau

            if (this.Angle !== goal) {
                this.Angle = goal
                SocketSend.setUint8(SocketSendIndex, InputOpNewMove, true)
                SocketSendIndex++
                SocketSend.setFloat32(SocketSendIndex, this.Angle, true)
                SocketSendIndex += 4
                SocketSendOperations++
            } else {
                SocketSend.setUint8(SocketSendIndex, InputOpContinueMove, true)
                SocketSendIndex++
                SocketSendOperations++
            }

            // TODO improve
            // this.X += Math.sin(this.Angle) * this.Speed * InverseNetRate
            // this.Z -= Math.cos(this.Angle) * this.Speed * InverseNetRate

            if (this.Animation === HumanAnimationIdle)
                this.Animation = HumanAnimationWalk

            if (this.UpdateAnimation() === AnimationDone)
                this.AnimationFrame = 0
        }
    }
    Update() {
        switch (this.Status) {
            case HumanDead:
                this.Dead()
            case HumanMissile:
                this.Missile()
                break
            default:
                this.Walk()
                break
        }
        this.LerpNetCode()
    }
}
const BaronAnimationIdle = []
const BaronAnimationWalk = []
const BaronAnimationMelee = []
const BaronAnimationMissile = []
const BaronAnimationDeath = []

const BaronSleep = 0
const BaronDead = 1
const BaronLook = 2
const BaronChase = 3
const BaronMelee = 4
const BaronMissile = 5

class Baron extends Thing {
    constructor(world, nid, x, y, z, direction, heatlh, status) {
        super()
        this.World = world
        this.UID = BaronUID
        this.SID = "baron"
        this.NID = nid
        this.Update = this.BaronUpdate
        this.Animation = BaronAnimationWalk
        this.X = x
        this.Y = y
        this.Z = z
        this.Angle = DirectionToAngle[direction]
        this.OldX = x
        this.OldY = y
        this.OldZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = heatlh
        this.Status = status
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    NetUpdateState(status) {
        if (this.Status === status)
            return
        this.AnimationMod = 0
        this.AnimationFrame = 0
        switch (status) {
            case BaronDead:
                this.Animation = BaronAnimationDeath
                break
            case BaronMelee:
                this.Animation = BaronAnimationMelee
                PlaySound("baron-melee")
                break
            case BaronMissile:
                this.Animation = BaronAnimationMissile
                PlaySound("baron-missile")
                break
            case BaronChase:
                if (Math.random() < 0.1)
                    PlaySound("baron-scream")
            default:
                this.Animation = BaronAnimationWalk
                break
        }
        this.Status = status
    }
    NetUpdateHealth(health) {
        if (health < this.Health) {
            if (health < 1) {
                PlaySound("baron-death")
            } else {
                PlaySound("baron-pain")
            }
            for (let i = 0; i < 20; i++) {
                let spriteName = "blood-" + Math.floor(Math.random() * 3)
                let x = this.X + this.Radius * (1 - Math.random() * 2)
                let y = this.Y + this.Height * Math.random()
                let z = this.Z + this.Radius * (1 - Math.random() * 2)
                const spread = 0.2
                let dx = spread * (1 - Math.random() * 2)
                let dy = spread * Math.random()
                let dz = spread * (1 - Math.random() * 2)
                new Blood(this.World, x, y, z, dx, dy, dz, spriteName)
            }

        }
        this.Health = health
    }
    Dead() {
        if (this.AnimationFrame === this.Animation.length - 1) {
            this.Update = this.EmptyUpdate
        } else {
            this.UpdateAnimation()
        }
    }
    Look() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
        }
    }
    Melee() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
            this.Animation = BaronAnimationWalk
        }
    }
    Missile() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
            this.Animation = BaronAnimationWalk
        }
    }
    Chase() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
        }
    }
    BaronUpdate() {
        switch (this.Status) {
            case BaronDead:
                this.Dead()
                break
            case BaronLook:
                this.Look()
                break
            case BaronMelee:
                this.Melee()
                break
            case BaronMissile:
                this.Missile()
                break
            case BaronChase:
                this.Chase()
                break
        }
        this.LerpNetCode()
    }
    EmptyUpdate() {}
}
const TILE_NONE = 0
const TILE_GROUND = 1
const TILE_RAILS_RIGHT = 2
const TILE_STAIRS_RIGHT = 3
const TILE_RAIL = 4
const TILE_WALL = 5
const TILE_WATER_TOP = 6
const TILE_WATER = 7
const TILE_RAILS_LEFT = 8
const TILE_STAIRS_LEFT = 9

const AMBIENT_LOW = 100
const AMBIENT_HALF = 175
const AMBIENT_FULL = 255

const TileTexture = []
const TileClosed = []

class Tile {
    constructor() {
        this.type = TILE_NONE
        this.red = 0
        this.green = 0
        this.blue = 0
    }
    static Ambient(side1, side2, corner) {
        if (side1 && side2)
            return AMBIENT_LOW
        if (side1 || side2 || corner)
            return AMBIENT_HALF
        return AMBIENT_FULL
    }
}
const BlockSize = 8
const InverseBlockSize = 1.0 / BlockSize

const BLOCK_SLICE = BlockSize * BlockSize
const BlockAll = BLOCK_SLICE * BlockSize
const BLOCK_MESH = new RenderCopy(3, 3, 2, BlockAll * 6 * 4, BlockAll * 6 * 6)
const BLOCK_MESH_AMBIENT = new Array(BlockAll)
for (let i = 0; i < BlockAll; i++) {
    BLOCK_MESH_AMBIENT[i] = new Array(6)
    for (let j = 0; j < 6; j++) {
        BLOCK_MESH_AMBIENT[i][j] = new Uint8Array(4)
    }
}
const BLOCK_COLOR_DIM = BlockSize + 1
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
        this.thingCount = 0
        this.itemCount = 0
        this.missileCount = 0
        this.particleCount = 0
        this.lightCount = 0
        this.things = []
        this.items = []
        this.missiles = []
        this.particles = []
        this.lights = []
        this.tiles = []
        for (let t = 0; t < BlockAll; t++)
            this.tiles[t] = new Tile()
    }
    GetTilePointerUnsafe(x, y, z) {
        return this.tiles[x + y * BlockSize + z * BLOCK_SLICE]
    }
    GetTileTypeUnsafe(x, y, z) {
        return this.tiles[x + y * BlockSize + z * BLOCK_SLICE].type
    }
    AddThing(thing) {
        this.things[this.thingCount] = thing
        this.thingCount++
    }
    AddItem(item) {
        this.items[this.itemCount] = item
        this.itemCount++
    }
    AddMissile(missile) {
        this.missiles[this.missileCount] = missile
        this.missileCount++
    }
    AddParticle(particle) {
        this.particles[this.particleCount] = particle
        this.particleCount++
    }
    RemoveThing(thing) {
        let len = this.thingCount
        for (let i = 0; i < len; i++) {
            if (this.things[i] === thing) {
                this.things[i] = this.things[len - 1]
                this.things[len - 1] = null
                this.thingCount--
                return
            }
        }
    }
    RemoveItem(item) {
        let len = this.itemCount
        for (let i = 0; i < len; i++) {
            if (this.items[i] === item) {
                this.items[i] = this.items[len - 1]
                this.items[len - 1] = null
                this.itemCount--
                break
            }
        }
    }
    RemoveMissile(missile) {
        let len = this.missileCount
        for (let i = 0; i < len; i++) {
            if (this.missiles[i] === missile) {
                this.missiles[i] = this.missiles[len - 1]
                this.missiles[len - 1] = null
                this.missileCount--
                break
            }
        }
    }
    RemoveParticle(particle) {
        let len = this.particleCount
        for (let i = 0; i < len; i++) {
            if (this.particles[i] === particle) {
                this.particles[i] = this.particles[len - 1]
                this.particles[len - 1] = null
                this.particleCount--
                break
            }
        }
    }
    AddLight(light) {
        this.lights[this.lightCount] = light
        this.lightCount++
    }
    RemoveLight(light) {
        for (let i = 0; i < this.lightCount; i++) {
            if (this.lights[i] === light) {
                for (let j = i; j < this.lightCount - 1; j++)
                    this.lights[j] = this.lights[j + 1]
                this.lightCount--
                return
            }
        }
    }
    AmbientMesh(world) {
        for (let bz = 0; bz < BlockSize; bz++) {
            for (let by = 0; by < BlockSize; by++) {
                for (let bx = 0; bx < BlockSize; bx++) {
                    let index = bx + by * BlockSize + bz * BLOCK_SLICE
                    if (this.tiles[index].type === TILE_NONE)
                        continue

                    let ao_mmz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by - 1, bz)]
                    let ao_mmm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)]
                    let ao_mmp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by - 1, bz + 1)]
                    let ao_mzp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by, bz + 1)]
                    let ao_mzm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by, bz - 1)]
                    let ao_mpz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by + 1, bz)]
                    let ao_mpp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by + 1, bz + 1)]
                    let ao_mpm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx - 1, by + 1, bz - 1)]
                    let ao_zpp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by + 1, bz + 1)]
                    let ao_zmp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by - 1, bz + 1)]
                    let ao_zpm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by + 1, bz - 1)]
                    let ao_zmm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx, by - 1, bz - 1)]
                    let ao_ppz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by + 1, bz)]
                    let ao_pmz = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by - 1, bz)]
                    let ao_pzp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by, bz + 1)]
                    let ao_pzm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by, bz - 1)]
                    let ao_pmm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by - 1, bz - 1)]
                    let ao_ppm = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by + 1, bz - 1)]
                    let ao_ppp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by + 1, bz + 1)]
                    let ao_pmp = TileClosed[world.GetTileType(this.x, this.y, this.z, bx + 1, by - 1, bz + 1)]

                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][0] = Tile.Ambient(ao_pmz, ao_pzm, ao_pmm)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][1] = Tile.Ambient(ao_ppz, ao_pzm, ao_ppm)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][2] = Tile.Ambient(ao_ppz, ao_pzp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveX][3] = Tile.Ambient(ao_pmz, ao_pzp, ao_pmp)

                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][0] = Tile.Ambient(ao_mmz, ao_mzm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][1] = Tile.Ambient(ao_mmz, ao_mzp, ao_mmp)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][2] = Tile.Ambient(ao_mpz, ao_mzp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeX][3] = Tile.Ambient(ao_mpz, ao_mzm, ao_mpm)

                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][0] = Tile.Ambient(ao_mpz, ao_zpm, ao_mpm)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][1] = Tile.Ambient(ao_mpz, ao_zpp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][2] = Tile.Ambient(ao_ppz, ao_zpp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveY][3] = Tile.Ambient(ao_ppz, ao_zpm, ao_ppm)

                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][0] = Tile.Ambient(ao_mmz, ao_zmm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][1] = Tile.Ambient(ao_pmz, ao_zmm, ao_pmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][2] = Tile.Ambient(ao_pmz, ao_zmp, ao_pmp)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeY][3] = Tile.Ambient(ao_mmz, ao_zmp, ao_mmp)

                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][0] = Tile.Ambient(ao_pzp, ao_zmp, ao_pmp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][1] = Tile.Ambient(ao_pzp, ao_zpp, ao_ppp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][2] = Tile.Ambient(ao_mzp, ao_zpp, ao_mpp)
                    BLOCK_MESH_AMBIENT[index][WorldPositiveZ][3] = Tile.Ambient(ao_mzp, ao_zmp, ao_mmp)

                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][0] = Tile.Ambient(ao_mzm, ao_zmm, ao_mmm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][1] = Tile.Ambient(ao_mzm, ao_zpm, ao_mpm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][2] = Tile.Ambient(ao_pzm, ao_zpm, ao_ppm)
                    BLOCK_MESH_AMBIENT[index][WorldNegativeZ][3] = Tile.Ambient(ao_pzm, ao_zmm, ao_pmm)
                }
            }
        }
    }
    ColorMesh(world) {
        for (let bz = 0; bz < BLOCK_COLOR_DIM; bz++) {
            for (let by = 0; by < BLOCK_COLOR_DIM; by++) {
                for (let bx = 0; bx < BLOCK_COLOR_DIM; bx++) {
                    let color = [0, 0, 0, 0]

                    let block_zzz = world.GetTilePointer(this.x, this.y, this.z, bx, by, bz)
                    let block_mzz = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by, bz)
                    let block_mzm = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by, bz - 1)
                    let block_zzm = world.GetTilePointer(this.x, this.y, this.z, bx, by, bz - 1)
                    let block_zmz = world.GetTilePointer(this.x, this.y, this.z, bx, by - 1, bz)
                    let block_mmz = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by - 1, bz)
                    let block_mmm = world.GetTilePointer(this.x, this.y, this.z, bx - 1, by - 1, bz - 1)
                    let block_zmm = world.GetTilePointer(this.x, this.y, this.z, bx, by - 1, bz - 1)

                    if (block_zzz === null || TileClosed[block_zzz.type]) {
                        this.DetermineLight(block_mzz, color)
                        this.DetermineLight(block_zmz, color)
                        this.DetermineLight(block_zzm, color)
                    }
                    if (block_mzz === null || TileClosed[block_mzz.type]) {
                        this.DetermineLight(block_zzz, color)
                        this.DetermineLight(block_zmz, color)
                        this.DetermineLight(block_zzm, color)
                    }
                    if (block_mzm === null || TileClosed[block_mzm.type]) {
                        this.DetermineLight(block_mzz, color)
                        this.DetermineLight(block_zzm, color)
                        this.DetermineLight(block_mmm, color)
                    }
                    if (block_zzm === null || TileClosed[block_zzm.type]) {
                        this.DetermineLight(block_zzz, color)
                        this.DetermineLight(block_mzm, color)
                        this.DetermineLight(block_zmm, color)
                    }
                    if (block_zmz === null || TileClosed[block_zmz.type]) {
                        this.DetermineLight(block_zzz, color)
                        this.DetermineLight(block_mmz, color)
                        this.DetermineLight(block_zmm, color)
                    }
                    if (block_mmz === null || TileClosed[block_mmz.type]) {
                        this.DetermineLight(block_mzz, color)
                        this.DetermineLight(block_mmm, color)
                        this.DetermineLight(block_zmz, color)
                    }
                    if (block_mmm === null || TileClosed[block_mmm.type]) {
                        this.DetermineLight(block_mzm, color)
                        this.DetermineLight(block_zmm, color)
                        this.DetermineLight(block_mmz, color)
                    }
                    if (block_zmm === null || TileClosed[block_zmm.type]) {
                        this.DetermineLight(block_zzm, color)
                        this.DetermineLight(block_zmz, color)
                        this.DetermineLight(block_mmm, color)
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
    DetermineLight(tile, color) {
        if (tile === null)
            return
        if (!TileClosed[tile.type]) {
            color[0] += tile.red
            color[1] += tile.green
            color[2] += tile.blue
            color[3]++
        }
    }
    LightOfSide(xs, ys, zs, side) {
        switch (side) {
            case WorldPositiveX:
                return [
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            case WorldNegativeX:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
            case WorldPositiveY:
                return [
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + (ys + 1) * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE]
                ]
            case WorldNegativeY:
                return [
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + zs * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + 1 + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE],
                    BLOCK_MESH_COLOR[xs + ys * BLOCK_COLOR_DIM + (zs + 1) * BLOCK_COLOR_SLICE]
                ]
            case WorldPositiveZ:
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
    BuildMesh(world) {
        this.AmbientMesh(world)
        this.ColorMesh(world)
        BLOCK_MESH.Zero()
        for (let side = 0; side < 6; side++) {
            let mesh_begin_index = BLOCK_MESH.index_pos
            let ptr_x = SLICE_X[side]
            let ptr_y = SLICE_Y[side]
            let ptr_z = SLICE_Z[side]
            let toward = SLICE_TOWARDS[side]
            for (SLICE[2] = 0; SLICE[2] < BlockSize; SLICE[2]++) {
                for (SLICE[1] = 0; SLICE[1] < BlockSize; SLICE[1]++) {
                    for (SLICE[0] = 0; SLICE[0] < BlockSize; SLICE[0]++) {
                        let type = this.GetTileTypeUnsafe(SLICE[ptr_x], SLICE[ptr_y], SLICE[ptr_z])
                        if (type === TILE_NONE)
                            continue
                        SLICE_TEMP[0] = SLICE[0]
                        SLICE_TEMP[1] = SLICE[1]
                        SLICE_TEMP[2] = SLICE[2] + toward
                        if (TileClosed[world.GetTileType(this.x, this.y, this.z, SLICE_TEMP[ptr_x], SLICE_TEMP[ptr_y], SLICE_TEMP[ptr_z])])
                            continue
                        let xs = SLICE[ptr_x]
                        let ys = SLICE[ptr_y]
                        let zs = SLICE[ptr_z]
                        let index = xs + ys * BlockSize + zs * BLOCK_SLICE

                        let texture = TileTexture[type]
                        let bx = xs + BlockSize * this.x
                        let by = ys + BlockSize * this.y
                        let bz = zs + BlockSize * this.z

                        let light = this.LightOfSide(xs, ys, zs, side)
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
    RenderThings(spriteSet, spriteBuffer, camX, camZ, camAngle) {
        for (let i = 0; i < this.thingCount; i++) {
            let thing = this.things[i]
            if (spriteSet.has(thing)) continue
            spriteSet.add(thing)
            thing.Render(spriteBuffer, camX, camZ, camAngle)
        }
        for (let i = 0; i < this.itemCount; i++) {
            let item = this.items[i]
            if (spriteSet.has(item)) continue
            spriteSet.add(item)
            item.Render(spriteBuffer, camX, camZ, camAngle)
        }
        for (let i = 0; i < this.missileCount; i++) {
            let missile = this.missiles[i]
            if (spriteSet.has(missile)) continue
            spriteSet.add(missile)
            missile.Render(spriteBuffer, camX, camZ, camAngle)
        }
        for (let i = 0; i < this.particleCount; i++) {
            let particle = this.particles[i]
            if (spriteSet.has(particle)) continue
            spriteSet.add(particle)
            particle.Render(spriteBuffer, camX, camZ)
        }
    }
}
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
class Cast {
    static Chunk(block, from_x, from_y, from_z, to_x, to_y, to_z) {
        let x = Math.floor(from_x)
        let y = Math.floor(from_y)
        let z = Math.floor(from_z)
        let dt_dx, dt_dy, dt_dz
        let inc_x, inc_y, inc_z
        let next_x, next_y, next_z
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
            if (TileClosed[block.GetTileTypeUnsafe(x, y, z)])
                return false
            else if (x === Math.floor(to_x) && y === Math.floor(to_y) && z === Math.floor(to_z))
                return true
            if (next_x < next_y) {
                if (next_x < next_z) {
                    x += inc_x
                    if (x < 0 || x >= BlockSize)
                        return false
                    next_x += dt_dx
                } else {
                    z += inc_z
                    if (z < 0 || z >= BlockSize)
                        return false
                    next_z += dt_dz
                }
            } else {
                if (next_y < next_z) {
                    y += inc_y
                    if (y < 0 || y >= BlockSize)
                        return false
                    next_y += dt_dy
                } else {
                    z += inc_z
                    if (z < 0 || z >= BlockSize)
                        return false
                    next_z += dt_dz
                }
            }
        }
    }
    static World(world, from_x, from_y, from_z, to_x, to_y, to_z) {
        let x = Math.floor(from_x)
        let y = Math.floor(from_y)
        let z = Math.floor(from_z)
        let dt_dx, dt_dy, dt_dz
        let inc_x, inc_y, inc_z
        let next_x, next_y, next_z
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
                    if (x < 0 || x >= world.blocks_w) {
                        return [x + 0.5, y + 0.5, z + 0.5, inc_x < 0 ? WorldPositiveX : WorldNegativeX]
                    }
                    let cx = Math.floor(x * InverseBlockSize)
                    let cy = Math.floor(y * InverseBlockSize)
                    let cz = Math.floor(z * InverseBlockSize)
                    let bx = x % BlockSize
                    let by = y % BlockSize
                    let bz = z % BlockSize
                    if (TileClosed[world.GetTileType(cx, cy, cz, bx, by, bz)]) {
                        x -= inc_x
                        return [x, y, z, inc_x < 0 ? WorldPositiveX : WorldNegativeX]
                    }
                    next_x += dt_dx
                } else {
                    z += inc_z
                    if (z < 0 || z >= world.blocks_l) {
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    let cx = Math.floor(x * InverseBlockSize)
                    let cy = Math.floor(y * InverseBlockSize)
                    let cz = Math.floor(z * InverseBlockSize)
                    let bx = x % BlockSize
                    let by = y % BlockSize
                    let bz = z % BlockSize
                    if (TileClosed[world.GetTileType(cx, cy, cz, bx, by, bz)]) {
                        z -= inc_z
                        return [x, y, z, inc_x < 0 ? WorldPositiveX : WorldNegativeX]
                    }
                    next_z += dt_dz
                }
            } else {
                if (next_y < next_z) {
                    y += inc_y
                    if (y < 0 || y >= world.blocks_h) {
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    let cx = Math.floor(x * InverseBlockSize)
                    let cy = Math.floor(y * InverseBlockSize)
                    let cz = Math.floor(z * InverseBlockSize)
                    let bx = x % BlockSize
                    let by = y % BlockSize
                    let bz = z % BlockSize
                    if (TileClosed[world.GetTileType(cx, cy, cz, bx, by, bz)]) {
                        y -= inc_y
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    next_y += dt_dy
                } else {
                    z += inc_z
                    if (z < 0 || z >= world.blocks_l) {
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    let cx = Math.floor(x * InverseBlockSize)
                    let cy = Math.floor(y * InverseBlockSize)
                    let cz = Math.floor(z * InverseBlockSize)
                    let bx = x % BlockSize
                    let by = y % BlockSize
                    let bz = z % BlockSize
                    if (TileClosed[world.GetTileType(cx, cy, cz, bx, by, bz)]) {
                        z -= inc_z
                        return [x + 0.5, y + 0.5, z + 0.5]
                    }
                    next_z += dt_dz
                }
            }
        }
    }
}
class Parser {
    static read(str) {
        let data = {}
        let stack = [data]
        let key = ""
        let value = ""
        let state = "key"
        for (let i = 0; i < str.length; i++) {
            let c = str[i]
            if (c === ":") {
                state = "value"
            } else if (c === ",") {
                let pc = str[i - 1]
                if (pc !== "}" && pc !== "]") {
                    if (stack[0].constructor === Array) {
                        stack[0].push(value)
                    } else {
                        stack[0][key] = value
                        key = ""
                        state = "key"
                    }
                    value = ""
                }
            } else if (c === "{") {
                let map = {}
                if (stack[0].constructor === Array) {
                    stack[0].push(map)
                    state = "key"
                } else {
                    stack[0][key] = map
                    key = ""
                }
                stack.unshift(map)
            } else if (c === "[") {
                let array = []
                if (stack[0].constructor === Array) {
                    stack[0].push(array)
                } else {
                    stack[0][key] = array
                    key = ""
                }
                stack.unshift(array)
                state = "value"
            } else if (c === "}") {
                let pc = str[i - 1]
                if (pc !== "," && pc !== "{" && pc !== "]" && pc !== "}") {
                    stack[0][key] = value
                    key = ""
                    value = ""
                }
                stack.shift()
                if (stack[0].constructor === Array) state = "value"
                else state = "key"
            } else if (c === "]") {
                let pc = str[i - 1]
                if (pc !== "," && pc !== "[" && pc !== "]" && pc !== "}") {
                    stack[0].push(value)
                    value = ""
                }
                stack.shift()
                if (stack[0].constructor === Array) state = "value"
                else state = "key"
            } else if (state === "key") {
                key += c
            } else
                value += c
        }
        let pc = str[str.length - 1]
        if (pc !== "," && pc !== "]" && pc !== "}")
            stack[0][key] = value
        return data
    }
}
const NetUpdateRate = 50
const InverseNetRate = 16.67 / NetUpdateRate

const WorldPositiveX = 0
const WorldPositiveY = 1
const WorldPositiveZ = 2
const WorldNegativeX = 3
const WorldNegativeY = 4
const WorldNegativeZ = 5

const BroadcastNew = 0
const BroadcastDelete = 1

class World {
    constructor(g, gl) {
        this.g = g
        this.gl = gl
        this.width
        this.height
        this.length
        this.slice
        this.all
        this.blocks
        this.viewable
        this.spriteSet
        this.spriteBuffer
        this.spriteCount
        this.thingCount
        this.itemCount
        this.missileCount
        this.particleCount
        this.things
        this.items
        this.missiles
        this.particles
        this.netLookup
        this.occluder = new Occluder()
        this.PID
    }
    Load(raw) {
        this.blocks = []
        this.viewable = []
        this.spriteSet = new Set()
        this.spriteBuffer = {}
        this.spriteCount = {}
        this.thingCount = 0
        this.itemCount = 0
        this.missileCount = 0
        this.particleCount = 0
        this.things = []
        this.items = []
        this.missiles = []
        this.particles = []
        this.netLookup = {}

        let dat = new DataView(raw)
        let dex = 0

        this.PID = dat.getUint16(dex, true)
        dex += 2

        this.width = dat.getUint16(dex, true)
        dex += 2
        this.height = dat.getUint16(dex, true)
        dex += 2
        this.length = dat.getUint16(dex, true)
        dex += 2
        this.slice = this.width * this.height
        this.all = this.slice * this.length

        let bx = 0
        let by = 0
        let bz = 0
        for (let b = 0; b < this.all; b++) {
            this.blocks[b] = new Block(bx, by, bz)
            bx++
            if (bx === this.width) {
                bx = 0
                by++
                if (by === this.height) {
                    by = 0
                    bz++
                }
            }
        }

        for (let b = 0; b < this.all; b++) {
            let block = this.blocks[b]
            let notEmpty = dat.getUint8(dex, true)
            dex += 1

            if (notEmpty) {
                for (let t = 0; t < BlockAll; t++) {
                    let tileType = dat.getUint8(dex, true)
                    dex += 1
                    block.tiles[t].type = tileType
                }
            }

            let thingCount = dat.getUint8(dex, true)
            dex += 1
            for (let t = 0; t < thingCount; t++) {
                let uid = dat.getUint16(dex, true)
                dex += 2
                let nid = dat.getUint16(dex, true)
                dex += 2
                let x = dat.getFloat32(dex, true)
                dex += 4
                let y = dat.getFloat32(dex, true)
                dex += 4
                let z = dat.getFloat32(dex, true)
                dex += 4
                switch (uid) {
                    case HumanUID:
                        {
                            let angle = dat.getFloat32(dex, true)
                            dex += 4
                            let health = dat.getUint16(dex, true)
                            dex += 2
                            let status = dat.getUint8(dex, true)
                            dex += 1
                            if (nid === this.PID) new You(this, nid, x, y, z, angle, health, status)
                            else new Human(this, nid, x, y, z, angle, health, status)
                        }
                        break
                    case BaronUID:
                        {
                            let direction = dat.getUint8(dex, true)
                            dex += 1
                            let health = dat.getUint16(dex, true)
                            dex += 2
                            let status = dat.getUint8(dex, true)
                            dex += 1
                            new Baron(this, nid, x, y, z, direction, health, status)
                        }
                        break
                    case TreeUID:
                        new Tree(this, nid, x, y, z)
                        break
                }
            }

            let itemCount = dat.getUint8(dex, true)
            for (let t = 0; t < itemCount; t++) {
                console.log("new item")
            }
            dex += 1

            let missileCount = dat.getUint8(dex, true)
            dex += 1
            for (let t = 0; t < missileCount; t++) {
                let uid = dat.getUint16(dex, true)
                dex += 2
                switch (uid) {
                    case PlasmaUID:
                        {
                            let nid = dat.getUint16(dex, true)
                            dex += 2
                            let x = dat.getFloat32(dex, true)
                            dex += 4
                            let y = dat.getFloat32(dex, true)
                            dex += 4
                            let z = dat.getFloat32(dex, true)
                            dex += 4
                            let dx = dat.getFloat32(dex, true)
                            dex += 4
                            let dy = dat.getFloat32(dex, true)
                            dex += 4
                            let dz = dat.getFloat32(dex, true)
                            dex += 4
                            let damage = dat.getUint16(dex, true)
                            dex += 2
                            new Plasma(this, nid, damage, x, y, z, dx, dy, dz)
                        }
                        break
                }
            }

            let lightCount = dat.getUint8(dex, true)
            dex += 1
            for (let t = 0; t < lightCount; t++) {
                let x = dat.getUint8(dex, true)
                dex += 1
                let y = dat.getUint8(dex, true)
                dex += 1
                let z = dat.getUint8(dex, true)
                dex += 1
                let rgb = dat.getInt32(dex, true)
                dex += 4
                block.AddLight(new Light(x, y, z, rgb))
            }
        }

        this.build()
    }
    build() {
        for (let i = 0; i < this.all; i++) {
            let block = this.blocks[i]
            for (let j = 0; j < block.lights.length; j++)
                Light.Add(this, block, block.lights[j])
            Occluder.SetBlockVisible(block)
        }
        for (let i = 0; i < this.all; i++)
            this.blocks[i].BuildMesh(this)
    }
    FindBlock(x, y, z) {
        let gx = Math.floor(x)
        let gy = Math.floor(y)
        let gz = Math.floor(z)
        let bx = Math.floor(gx * InverseBlockSize)
        let by = Math.floor(gy * InverseBlockSize)
        let bz = Math.floor(gz * InverseBlockSize)
        let tx = gx - bx * BlockSize
        let ty = gy - by * BlockSize
        let tz = gz - bz * BlockSize
        let block = this.blocks[bx + by * this.width + bz * this.slice]
        return block.tiles[tx + ty * BlockSize + tz * BLOCK_SLICE].type
    }
    GetTilePointer(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BlockSize
            cx--
        }
        while (bx >= BlockSize) {
            bx -= BlockSize
            cx++
        }
        while (by < 0) {
            by += BlockSize
            cy--
        }
        while (by >= BlockSize) {
            by -= BlockSize
            cy++
        }
        while (bz < 0) {
            bz += BlockSize
            cz--
        }
        while (bz >= BlockSize) {
            bz -= BlockSize
            cz++
        }
        let block = this.GetBlock(cx, cy, cz)
        if (block === null)
            return null
        return block.GetTilePointerUnsafe(bx, by, bz)
    }
    GetTileType(cx, cy, cz, bx, by, bz) {
        while (bx < 0) {
            bx += BlockSize
            cx--
        }
        while (bx >= BlockSize) {
            bx -= BlockSize
            cx++
        }
        while (by < 0) {
            by += BlockSize
            cy--
        }
        while (by >= BlockSize) {
            by -= BlockSize
            cy++
        }
        while (bz < 0) {
            bz += BlockSize
            cz--
        }
        while (bz >= BlockSize) {
            bz -= BlockSize
            cz++
        }
        let block = this.GetBlock(cx, cy, cz)
        if (block === null) {
            return TILE_NONE
        }
        return block.GetTileTypeUnsafe(bx, by, bz)
    }
    GetBlock(x, y, z) {
        if (x < 0 || x >= this.width)
            return null
        if (y < 0 || y >= this.height)
            return null
        if (z < 0 || z >= this.length)
            return null
        return this.blocks[x + y * this.width + z * this.slice]
    }
    AddThing(thing) {
        this.things[this.thingCount] = thing
        this.thingCount++
        this.netLookup[thing.NID] = thing

        let count = this.spriteCount[thing.SID]
        if (count) {
            this.spriteCount[thing.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[thing.SID].vertices.length)
                this.spriteBuffer[thing.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[thing.SID])
        } else {
            this.spriteCount[thing.SID] = 1
            this.spriteBuffer[thing.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    AddItem(item) {
        this.items[this.itemCount] = item
        this.itemCount++
        this.netLookup[item.NID] = item

        let count = this.spriteCount[item.SID]
        if (count) {
            this.spriteCount[item.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[item.SID].vertices.length)
                this.spriteBuffer[item.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[item.SID])
        } else {
            this.spriteCount[item.SID] = 1
            this.spriteBuffer[item.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    AddMissile(missile) {
        this.missiles[this.missileCount] = missile
        this.missileCount++
        this.netLookup[missile.NID] = missile

        let count = this.spriteCount[missile.SID]
        if (count) {
            this.spriteCount[missile.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[missile.SID].vertices.length)
                this.spriteBuffer[missile.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[missile.SID])
        } else {
            this.spriteCount[missile.SID] = 1
            this.spriteBuffer[missile.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 40, 60)
        }
    }
    AddParticle(particle) {
        this.particles[this.particleCount] = particle
        this.particleCount++

        let count = this.spriteCount[particle.SID]
        if (count) {
            this.spriteCount[particle.SID] = count + 1
            if ((count + 2) * 16 > this.spriteBuffer[particle.SID].vertices.length) {
                this.spriteBuffer[particle.SID] = RenderBuffer.Expand(this.gl, this.spriteBuffer[particle.SID])
            }
        } else {
            this.spriteCount[particle.SID] = 1
            this.spriteBuffer[particle.SID] = RenderBuffer.Init(this.gl, 3, 0, 2, 120, 180)
        }
    }
    RemoveThing(thing) {
        let len = this.thingCount
        for (let i = 0; i < len; i++) {
            if (this.things[i] === thing) {
                this.things[i] = this.things[len - 1]
                this.things[len - 1] = null
                this.thingCount--
                this.spriteCount[thing.SID]--
                delete this.netLookup[thing.NID]
                break
            }
        }
    }
    RemoveItem(item) {
        let len = this.itemCount
        for (let i = 0; i < len; i++) {
            if (this.items[i] === item) {
                this.items[i] = this.items[len - 1]
                this.items[len - 1] = null
                this.itemCount--
                this.spriteCount[item.SID]--
                delete this.netLookup[item.NID]
                break
            }
        }
    }
    RemoveMissile(missile) {
        let len = this.missileCount
        for (let i = 0; i < len; i++) {
            if (this.missiles[i] === missile) {
                this.missiles[i] = this.missiles[len - 1]
                this.missiles[len - 1] = null
                this.missileCount--
                this.spriteCount[missile.SID]--
                delete this.netLookup[missile.NID]
                break
            }
        }
    }
    RemoveParticle(particle) {
        let len = this.particleCount
        for (let i = 0; i < len; i++) {
            if (this.particles[i] === particle) {
                this.particles[i] = this.particles[len - 1]
                this.particles[len - 1] = null
                this.particleCount--
                this.spriteCount[particle.SID]--
                break
            }
        }
    }
    update() {
        let len = this.thingCount
        for (let i = 0; i < len; i++)
            this.things[i].Update()
        len = this.missileCount
        for (let i = 0; i < len; i++) {
            if (this.missiles[i].Update()) {
                this.missiles[i] = this.missiles[len - 1]
                this.missiles[len - 1] = null
                this.missileCount--
                len--
                i--
            }
        }
        len = this.particleCount
        for (let i = 0; i < this.particleCount; i++) {
            if (this.particles[i].Update()) {
                this.particles[i] = this.particles[len - 1]
                this.particles[len - 1] = null
                this.particleCount--
                len--
                i--

            }
        }
    }
    render(g, x, y, z, camX, camZ, camAngle) {
        let gl = this.gl
        let spriteSet = this.spriteSet
        let spriteBuffer = this.spriteBuffer

        this.occluder.prepare_frustum(g)
        this.occluder.occlude(this, x, y, z)

        spriteSet.clear()
        for (let key in spriteBuffer)
            spriteBuffer[key].Zero()

        g.set_program(gl, "texcol3d")
        g.update_mvp(gl)
        g.set_texture(gl, "tiles")

        for (let i = 0; i < OCCLUSION_VIEW_NUM; i++) {
            let block = this.viewable[i]

            block.RenderThings(spriteSet, spriteBuffer, camX, camZ, camAngle)

            let mesh = block.mesh
            if (mesh.vertex_pos === 0)
                continue

            RenderSystem.BindVao(gl, mesh)

            if (x == block.x) {
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveX], block.count_side[WorldPositiveX])
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeX], block.count_side[WorldNegativeX])
            } else if (x > block.x)
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveX], block.count_side[WorldPositiveX])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeX], block.count_side[WorldNegativeX])

            if (y == block.y) {
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveY], block.count_side[WorldPositiveY])
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeY], block.count_side[WorldNegativeY])
            } else if (y > block.y)
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveY], block.count_side[WorldPositiveY])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeY], block.count_side[WorldNegativeY])

            if (z == block.z) {
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveZ], block.count_side[WorldPositiveZ])
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeZ], block.count_side[WorldNegativeZ])
            } else if (z > block.z)
                RenderSystem.DrawRange(gl, block.begin_side[WorldPositiveZ], block.count_side[WorldPositiveZ])
            else
                RenderSystem.DrawRange(gl, block.begin_side[WorldNegativeZ], block.count_side[WorldNegativeZ])
        }

        g.set_program(gl, "texture3d")
        g.update_mvp(gl)
        for (let key in spriteBuffer) {
            let buffer = spriteBuffer[key]
            if (buffer.vertex_pos > 0) {
                g.set_texture(gl, key)
                RenderSystem.UpdateAndDraw(gl, buffer)
            }
        }
    }
}
class WorldState {
    constructor(app) {
        this.app = app
        this.snapshotTime = new Date().getTime()
        this.previousUpdate = new Date().getTime()
    }
    update() {
        let world = this.app.world

        if (SocketQueue.length > 0) {
            let raw = SocketQueue[SocketQueue.length - 1]
            SocketQueue = []

            let dat = new DataView(raw)
            let dex = 0

            let serverTime = dat.getUint32(dex, true)
            dex += 4

            this.snapshotTime = serverTime + 1552330000000
            this.previousUpdate = new Date().getTime()

            let broadcastCount = dat.getUint8(dex, true)
            dex += 1
            for (let b = 0; b < broadcastCount; b++) {
                let broadcastType = dat.getUint8(dex, true)
                dex += 1
                switch (broadcastType) {
                    case BroadcastNew:
                        {
                            let uid = dat.getUint16(dex, true)
                            dex += 2
                            let nid = dat.getUint16(dex, true)
                            dex += 2
                            if (nid in world.netLookup)
                                break
                            let x = dat.getFloat32(dex, true)
                            dex += 4
                            let y = dat.getFloat32(dex, true)
                            dex += 4
                            let z = dat.getFloat32(dex, true)
                            dex += 4
                            if (uid === PlasmaUID) {
                                let dx = dat.getFloat32(dex, true)
                                dex += 4
                                let dy = dat.getFloat32(dex, true)
                                dex += 4
                                let dz = dat.getFloat32(dex, true)
                                dex += 4
                                let damage = dat.getUint16(dex, true)
                                dex += 2
                                new Plasma(world, nid, damage, x, y, z, dx, dy, dz)
                            } else if (uid === HumanUID) {
                                let angle = dat.getFloat32(dex, true)
                                dex += 4
                                let health = dat.getUint16(dex, true)
                                dex += 2
                                let status = dat.getUint8(dex, true)
                                dex += 1
                                new Human(world, nid, x, y, z, angle, health, status)
                            } else {
                                throw new Error("missing new uid " + uid)
                            }
                        }
                        break
                    case BroadcastDelete:
                        {
                            let nid = dat.getUint16(dex, true)
                            dex += 2
                            let entity = world.netLookup[nid]
                            if (entity) entity.Cleanup()
                            else throw new Error("missing nid " + nid + " to delete")
                        }
                        break
                }
            }

            let thingCount = dat.getUint16(dex, true)
            dex += 2
            for (let t = 0; t < thingCount; t++) {
                let nid = dat.getUint16(dex, true)
                dex += 2
                let delta = dat.getUint8(dex, true)
                dex += 1
                let thing = world.netLookup[nid]
                if (thing) {
                    if (delta & 0x1) {
                        thing.NetX = dat.getFloat32(dex, true)
                        thing.DeltaNetX = (thing.NetX - thing.X) * InverseNetRate
                        dex += 4
                        thing.NetZ = dat.getFloat32(dex, true)
                        thing.DeltaNetZ = (thing.NetZ - thing.Z) * InverseNetRate
                        dex += 4
                    }
                    if (delta & 0x2) {
                        thing.NetY = dat.getFloat32(dex, true)
                        thing.DeltaNetY = (thing.NetY - thing.Y) * InverseNetRate
                        dex += 4
                    }
                    if (delta & 0x4) {
                        let health = dat.getUint16(dex, true)
                        dex += 2
                        thing.NetUpdateHealth(health)
                    }
                    if (delta & 0x8) {
                        let status = dat.getUint8(dex, true)
                        dex += 1
                        thing.NetUpdateState(status)
                    }
                    switch (thing.UID) {
                        case HumanUID:
                            if (delta & 0x10) {
                                thing.Angle = dat.getFloat32(dex, true)
                                dex += 4
                            }
                            break
                        case BaronUID:
                            if (delta & 0x10) {
                                let direction = dat.getUint8(dex, true)
                                dex += 1
                                if (direction !== DirectionNone)
                                    thing.Angle = DirectionToAngle[direction]
                            }
                            break
                    }
                } else {
                    throw new Error("missing thing nid " + nid)
                }
            }
        }

        world.update()

        if (SocketSendOperations > 0) {
            let buffer = SocketSend.buffer.slice(0, SocketSendIndex)
            let view = new DataView(buffer)
            view.setUint8(0, SocketSendOperations, true)

            SocketConnection.send(buffer)
            SocketSendIndex = 1
            SocketSendOperations = 0
        }
    }
    render() {
        let g = this.app.g
        let gl = this.app.gl
        let frame = this.app.frame
        let canvas = this.app.canvas
        let canvasOrtho = this.app.canvasOrtho
        let drawPerspective = this.app.drawPerspective
        let screen = this.app.screen
        let world = this.app.world
        let cam = this.app.camera

        cam.update()

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        g.set_perspective(drawPerspective, -cam.x, -cam.y, -cam.z, cam.rx, cam.ry)
        Matrix.Inverse(g.iv, g.v)

        let camBlockX = Math.floor(cam.x * InverseBlockSize)
        let camBlockY = Math.floor(cam.y * InverseBlockSize)
        let camBlockZ = Math.floor(cam.z * InverseBlockSize)

        world.render(g, camBlockX, camBlockY, camBlockZ, cam.x, cam.z, cam.ry)

        gl.disable(gl.DEPTH_TEST)
        gl.disable(gl.CULL_FACE)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, canvas.width, canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(canvasOrtho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, screen)
    }
}
let SocketConnection = null
let SocketQueue = []
let SocketSend = new DataView(new ArrayBuffer(128))
let SocketSendIndex = 1
let SocketSendOperations = 0

class Application {
    constructor() {
        let canvas = document.createElement("canvas")
        canvas.style.display = "block"
        canvas.style.position = "absolute"
        canvas.style.left = "0"
        canvas.style.right = "0"
        canvas.style.top = "0"
        canvas.style.bottom = "0"
        canvas.style.margin = "auto"
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let gl = canvas.getContext("webgl2")
        let g = new RenderSystem()

        this.configure_opengl(gl)

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6)
        let generics = RenderBuffer.Init(gl, 2, 3, 0, 1600, 2400)
        let generics2 = RenderBuffer.Init(gl, 2, 0, 2, 400, 600)

        this.on = true
        this.canvas = canvas
        this.gl = gl
        this.g = g
        this.screen = screen
        this.world = new World(g, gl)
        this.frame = null
        this.generics = generics
        this.generics2 = generics2
        this.camera = null
        this.state = new WorldState(this)

        document.onkeyup = Input.KeyUp
        document.onkeydown = Input.KeyDown
        document.onmouseup = Input.MouseUp
        document.onmousedown = Input.MouseDown
        document.onmousemove = Input.MouseMove

        // let self = this

        window.onblur = function () {
            // self.on = false
        }

        window.onfocus = function () {
            // self.on = true
        }
    }
    configure_opengl(gl) {
        gl.clearColor(0, 0, 0, 1)
        gl.depthFunc(gl.LEQUAL)
        gl.cullFace(gl.BACK)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
    }
    resize() {
        let gl = this.gl
        let canvas = this.canvas
        let screen = this.screen

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let canvasOrtho = []
        let drawOrtho = []
        let drawPerspective = []

        let scale = 1.0
        let drawWidth = canvas.width * scale
        let drawHeight = canvas.height * scale
        let ratio = drawWidth / drawHeight
        let fov = 2 * Math.atan(Math.tan(60 * (Math.PI / 180) / 2) / ratio) * (180 / Math.PI)

        Matrix.Orthographic(canvasOrtho, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0)
        Matrix.Orthographic(drawOrtho, 0.0, drawWidth, 0.0, drawHeight, 0.0, 1.0)
        Matrix.Perspective(drawPerspective, fov, 0.01, 100.0, ratio)

        if (this.frame === null)
            this.frame = FrameBuffer.Make(gl, drawWidth, drawHeight, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], "nearest", "depth")
        else
            FrameBuffer.Resize(gl, this.frame, drawWidth, drawHeight)

        screen.Zero()
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0)
        RenderSystem.UpdateVao(gl, screen)

        this.canvasOrtho = canvasOrtho
        this.drawOrtho = drawOrtho
        this.drawPerspective = drawPerspective
    }
    async init() {
        let self = this
        let g = this.g
        let gl = this.gl

        let data = await Network.Request("wad")
        await Wad.Load(g, gl, data)

        SocketConnection = await Network.Socket("ws://" + window.location.host + "/websocket")
        SocketConnection.binaryType = "arraybuffer"

        SocketConnection.onclose = function () {
            SocketConnection = null
            self.on = false
            throw new Error("Lost connection to server")
        }

        let raw = await new Promise(function (resolve) {
            SocketConnection.onmessage = function (event) {
                resolve(event.data)
            }
        })

        SocketConnection.onmessage = function (event) {
            SocketQueue.push(event.data)
        }

        this.world.Load(raw)

        this.player = this.world.netLookup[this.world.PID]
        this.camera = new Camera(this.player, 10.0, 0.0, 0.0)
        this.player.camera = this.camera
        console.log(this.player)
    }
    async run() {
        await this.init()
        let self = this
        window.onresize = function () {
            self.resize()
        }
        document.body.appendChild(this.canvas)
        this.resize()
        this.loop()
    }
    switch (state) {
        this.state = state
    }
    loop() {
        if (this.on) {
            this.state.update()
            this.state.render()
        }
        requestAnimationFrame(loop)
    }
}

let app = new Application()
app.run()

function loop() {
    app.loop()
}

function PlaySound(name) {
    let sound = Sounds[name]
    sound.pause()
    sound.volume = 0.25
    sound.currentTime = 0
    let promise = sound.play()
    if (promise) promise.then(_ => {}).catch(_ => {})
}
