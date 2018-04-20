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
        buffer.indices = new Uint16Array(index_limit);
        RenderSystem.MakeVao(gl, buffer, position, color, texture);
        return buffer;
    }
    static InitCopy(gl, source)
    {
        let buffer = new RenderBuffer(); 
        buffer.vertices = new Float32Array(source.vertex_pos);
        buffer.indices = new Uint16Array(source.index_pos);
        RenderBuffer.Copy(source, buffer);
        RenderSystem.MakeVao(gl, buffer, source.position, source.color, source.texture);
        RenderSystem.UpdateVao(gl, buffer);
        return buffer;
    }
    static Zero(buffer)
    {
        buffer.vertex_pos = 0;
        buffer.index_pos = 0;
        buffer.index_offset = 0;
    }
    static Copy(source, destination)
    {
        for (let i = 0; i < source.vertex_pos; i++)
        {
            destination.vertices[i] = source.vertices[i];
        }
        for (let i = 0; i < source.index_pos; i++)
        {
            destination.indices[i] = source.indices[i];
        }
        destination.index_offset = source.index_offset;
    }
}