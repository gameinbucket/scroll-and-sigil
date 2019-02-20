class RenderBuffer
{
    constructor()
    {
        this.vao;
        this.vbo;
        this.ebo;
        this.vertex_pos;
        this.index_pos;
        this.index_offset;
        this.vertices;
        this.indices;
    }
    static Init(gl, position, color, texture, vertex_limit, index_limit)
    {
        let buffer = new RenderBuffer();
        buffer.vertex_pos = 0;
        buffer.index_pos = 0;
        buffer.index_offset = 0;
        buffer.vertices = new Float32Array(vertex_limit * (position + color + texture));
        buffer.indices = new Uint32Array(index_limit);
        RenderSystem.MakeVao(gl, buffer, position, color, texture);
        return buffer;
    }
    static InitCopy(gl, source)
    {
        let buffer = new RenderBuffer(); 
        buffer.vertices = new Float32Array(source.vertex_pos);
        buffer.indices = new Uint32Array(source.index_pos);
        RenderBuffer.Copy(source, buffer);
        RenderSystem.MakeVao(gl, buffer, source.position, source.color, source.texture);
        RenderSystem.UpdateVao(gl, buffer);
        return buffer;
    }
    zero() {
        this.vertex_pos = 0;
        this.index_pos = 0;
        this.index_offset = 0;
    }
    static Copy(from, to)
    {
        for (let i = 0; i < from.vertex_pos; i++)
        {
            to.vertices[i] = from.vertices[i];
        }
        for (let i = 0; i < from.index_pos; i++)
        {
            to.indices[i] = from.indices[i];
        }
        to.vertex_pos = from.vertex_pos;
        to.index_pos = from.index_pos;
        to.index_offset = from.index_offset;
    }
}