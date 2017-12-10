class RenderBuffer
{
    constructor(vertexLimit, indexLimit)
    {
        this.vao;
        this.vbo;
        this.ebo;
        this.vertexPos;
        this.indexPos;
        this.indexOffset;
        this.vertices = new Float32Array(vertexLimit);
        this.indices = new Uint16Array(indexLimit);
        this.stride;
    }
    static Zero(buffer)
    {
        buffer.vertexPos = 0;
        buffer.indexPos = 0;
        buffer.indexOffset = 0;
    }
}