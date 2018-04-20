class RenderCopy
{
    constructor(position, color, texture, vertex_limit, index_limit)
    {
        this.position = position;
        this.color = color;
        this.texture = texture;
        this.vertex_pos = 0;
        this.index_pos = 0;
        this.index_offset = 0;
        this.vertices = new Float32Array(vertex_limit * (position + color + texture));
        this.indices = new Uint16Array(index_limit);
    }
    static Zero(buffer)
    {
        buffer.vertex_pos = 0;
        buffer.index_pos = 0;
        buffer.index_offset = 0;
    }
}