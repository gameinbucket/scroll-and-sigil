class RenderBuffer
{
    constructor(sys, gl, position, color, texture, vertexLimit, indexLimit)
    {
        this.vao;
        this.vbo;
        this.ebo;
        this.vertexPos = 0;
        this.indexPos = 0;
        this.indexOffset = 0;
        this.vertices = new Float32Array(vertexLimit * (position + color + texture));
        this.indices = new Uint16Array(indexLimit);
        RenderSystem.MakeVao(sys, gl, this, position, color, texture);
    }
    static Zero(buffer)
    {
        buffer.vertexPos = 0;
        buffer.indexPos = 0;
        buffer.indexOffset = 0;
    }
}