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
        let vertex = await Network.Request("shaders/" + name + ".v")
        let fragment = await Network.Request("shaders/" + name + ".f")
        let program = RenderSystem.CompileProgram(gl, vertex, fragment)
        this.shaders[name] = program
        this.mvp_location[name] = gl.getUniformLocation(program, "u_mvp")
        this.texture_location[name] = gl.getUniformLocation(program, "u_texture0")
    }
    async make_image(gl, name, wrap) {
        let texture = gl.createTexture()
        texture.image = new Image()
        texture.image.src = "textures/" + name + ".png"

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