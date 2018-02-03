class RenderCell
{
    static PositiveX(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertexPos++] = x + 1;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = z;
        buffer.vertices[buffer.vertexPos++] = 0.0;
        buffer.vertices[buffer.vertexPos++] = 0.0;
        buffer.vertices[buffer.vertexPos++] = index;
        
        buffer.vertices[buffer.vertexPos++] = x + 1;
        buffer.vertices[buffer.vertexPos++] = y + width;
        buffer.vertices[buffer.vertexPos++] = z;
        buffer.vertices[buffer.vertexPos++] = width;
        buffer.vertices[buffer.vertexPos++] = 0.0;
        buffer.vertices[buffer.vertexPos++] = index;
        
        buffer.vertices[buffer.vertexPos++] = x + 1;
        buffer.vertices[buffer.vertexPos++] = y + width;
        buffer.vertices[buffer.vertexPos++] = z + height;
        buffer.vertices[buffer.vertexPos++] = width;
        buffer.vertices[buffer.vertexPos++] = height;
        buffer.vertices[buffer.vertexPos++] = index;
        
        buffer.vertices[buffer.vertexPos++] = x + 1;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = z + height;
        buffer.vertices[buffer.vertexPos++] = 0.0;
        buffer.vertices[buffer.vertexPos++] = height;
        buffer.vertices[buffer.vertexPos++] = index;

        Render.Index4(buffer);
    }
}