class Render
{
    static Index4(buffer)
    {
        buffer.indices[buffer.indexPos++] = buffer.indexOffset;
        buffer.indices[buffer.indexPos++] = buffer.indexOffset + 1;
        buffer.indices[buffer.indexPos++] = buffer.indexOffset + 2;
        buffer.indices[buffer.indexPos++] = buffer.indexOffset + 2;
        buffer.indices[buffer.indexPos++] = buffer.indexOffset + 3;
        buffer.indices[buffer.indexPos++] = buffer.indexOffset;
        buffer.indexOffset += 4;
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
    static Circle(buffer, x, y, radius, red, green, blue)
    {
        const points = 32;
        const tau = Math.PI * 2.0;
        const slice = tau / points;
        
        let firstIndex = buffer.indexOffset;
        buffer.vertices[buffer.vertexPos++] = x;
        buffer.vertices[buffer.vertexPos++] = y;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        buffer.indexOffset++;

        let radian = 0;
        while (radian < tau)
        {
            buffer.vertices[buffer.vertexPos++] = x + Math.cos(radian) * radius;
            buffer.vertices[buffer.vertexPos++] = y + Math.sin(radian) * radius;
            buffer.vertices[buffer.vertexPos++] = red;
            buffer.vertices[buffer.vertexPos++] = green;
            buffer.vertices[buffer.vertexPos++] = blue;

            buffer.indices[buffer.indexPos++] = firstIndex;
            buffer.indices[buffer.indexPos++] = buffer.indexOffset;
            buffer.indices[buffer.indexPos++] = buffer.indexOffset + 1;
            buffer.indexOffset++;

            radian += slice;
        }
        buffer.indices[buffer.indexPos - 1] = firstIndex + 1;
    }
}