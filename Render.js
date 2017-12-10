class Render
{
    static Index4(buffer)
    {
        buffer.indices[buffer.indexPos++] = 0 + buffer.indexOffset;
        buffer.indices[buffer.indexPos++] = 1 + buffer.indexOffset;
        buffer.indices[buffer.indexPos++] = 2 + buffer.indexOffset;
        buffer.indices[buffer.indexPos++] = 2 + buffer.indexOffset;
        buffer.indices[buffer.indexPos++] = 3 + buffer.indexOffset;
        buffer.indices[buffer.indexPos++] = 0 + buffer.indexOffset;
        buffer.indexOffset += 4;
    }
    static Rectangle(buffer, x, y, width, height, red, green, blue)
    {
        buffer.vertices[buffer.vertexPos++] = x;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        buffer.vertices[buffer.vertexPos++] = x + width;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        buffer.vertices[buffer.vertexPos++] = x + width;
        buffer.vertices[buffer.vertexPos++] = y + height;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        buffer.vertices[buffer.vertexPos++] = x;
        buffer.vertices[buffer.vertexPos++] = y + height;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        Render.Index4(buffer);
    }
    static Image(buffer, x, y, width, height, left, top, right, bottom)
    {
        buffer.vertices[buffer.vertexPos++] = x;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = left;
        buffer.vertices[buffer.vertexPos++] = bottom;
        
        buffer.vertices[buffer.vertexPos++] = x + width;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = right;
        buffer.vertices[buffer.vertexPos++] = bottom;
        
        buffer.vertices[buffer.vertexPos++] = x + width;
        buffer.vertices[buffer.vertexPos++] = y + height;
        buffer.vertices[buffer.vertexPos++] = right;
        buffer.vertices[buffer.vertexPos++] = top;
        
        buffer.vertices[buffer.vertexPos++] = x;
        buffer.vertices[buffer.vertexPos++] = y + height;
        buffer.vertices[buffer.vertexPos++] = left;
        buffer.vertices[buffer.vertexPos++] = top;
        
        Render.Index4(buffer);
    }
}