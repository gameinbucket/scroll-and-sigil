class FrameBuffer {
    constructor(gl, width, height, internalFormat, format, type, linear, depth) {
        if (format.length !== internalFormat.length || format.length !== type.length) {
            console.error('framebuffer invalid')
        }
        this.fbo
        this.internalFormat = internalFormat
        this.format = format
        this.type = type
        this.width = width
        this.height = height
        this.linear = linear
        this.depth = depth
        this.depthTexture
        this.textures = []
        this.drawBuffers = []
        RenderSystem.MakeFrameBuffer(gl, this)
    }
    static Resize(gl, buffer, width, height) {
        buffer.width = width
        buffer.height = height
        RenderSystem.UpdateFrameBuffer(gl, buffer)
    }
}