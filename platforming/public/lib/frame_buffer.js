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
            console.error('framebuffer invalid')
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