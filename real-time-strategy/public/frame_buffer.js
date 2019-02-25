class FrameBuffer {
    constructor(sys, gl, width, height, internalFormat, format, type, linear, depth) {
        if (format.length !== internalFormat.length || format.length !== type.length) {
            console.error('framebuffer invalid');
        }
        this.fbo;
        this.internalFormat = internalFormat;
        this.format = format;
        this.type = type;
        this.width = width;
        this.height = height;
        this.linear = linear;
        this.depth = depth;
        this.depthTexture;
        this.textures = new Array(format.length);
        this.drawBuffers = new Array(format.length);
        RenderSystem.MakeFrameBuffer(sys, gl, this);
    }
    static Resize(sys, gl, buffer, width, height) {
        buffer.width = width;
        buffer.height = height;
        RenderSystem.UpdateFrameBuffer(sys, gl, buffer);
    }
}
