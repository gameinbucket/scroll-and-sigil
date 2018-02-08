class RenderBuffer
{
    constructor(sys, gl, position, color, texture, vertex_limit, index_limit)
    {
        this.vao;
        this.vbo;
        this.ebo;
        this.vertex_pos = 0;
        this.index_pos = 0;
        this.index_offset = 0;
        this.vertices = new Float32Array(vertex_limit * (position + color + texture));
        this.indices = new Uint16Array(index_limit);
        RenderSystem.MakeVao(sys, gl, this, position, color, texture);
    }
    static Zero(buffer)
    {
        buffer.vertex_pos = 0;
        buffer.index_pos = 0;
        buffer.index_offset = 0;
    }
}