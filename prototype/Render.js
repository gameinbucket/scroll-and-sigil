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
    static Skeleton(buffer, x, y, red, green, blue)
    {
        // should have points premade so that
        // point inside convex test can be pixel perfect
        // and only need to rotate points rather than remake
        const size = 1.0;

        Render.Circle(buffer, x, y, 12 * size, red, green, blue);
        
        // body
        Render.Line(buffer, x, y, 60, 4, -Math.PI * 0.5, red, green, blue);

        // right arm
        Render.Line(buffer, x, y - 16, 30, 2, -Math.PI * 0.35, red, green, blue);
        Render.Line(buffer, x + 14, y - 45, 30, 2, -Math.PI * 0.45, red, green, blue);
        
        // left arm
        Render.Line(buffer, x, y - 16, 30, 2, -Math.PI * 0.75, red, green, blue);
        
        // right leg
        Render.Line(buffer, x, y - 60, 30, 2, -Math.PI * 0.35, red, green, blue);
        
        // left leg
        Render.Line(buffer, x, y - 60, 30, 2, -Math.PI * 0.65, red, green, blue);
    }
    static Line(buffer, x, y, length, weight, radian, red, green, blue)
    {
        let sin = Math.sin(radian);
        let cos = Math.cos(radian);
        
        let x1 = 0;
        let y1 = -weight;
        let xx = x1 * cos - y1 * sin;
        let yy = x1 * sin + y1 * cos;
        x1 = x + xx
        y1 = y + yy

        let x2 = length;
        let y2 = -weight;
        xx = x2 * cos - y2 * sin;
        yy = x2 * sin + y2 * cos;
        x2 = x + xx
        y2 = y + yy

        let x3 = length;
        let y3 = weight;
        xx = x3 * cos - y3 * sin;
        yy = x3 * sin + y3 * cos;
        x3 = x + xx
        y3 = y + yy

        let x4 = 0;
        let y4 = weight;
        xx = x4 * cos - y4 * sin;
        yy = x4 * sin + y4 * cos;
        x4 = x + xx
        y4 = y + yy

        sin *= length;
        cos *= length;

        Render.Circle(buffer, x, y, weight, red, green, blue);
        Render.Circle(buffer, x + cos, y + sin, weight, red, green, blue);

        buffer.vertices[buffer.vertexPos++] = x1;
        buffer.vertices[buffer.vertexPos++] = y1;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        buffer.vertices[buffer.vertexPos++] = x2;
        buffer.vertices[buffer.vertexPos++] = y2;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        buffer.vertices[buffer.vertexPos++] = x3;
        buffer.vertices[buffer.vertexPos++] = y3;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        buffer.vertices[buffer.vertexPos++] = x4;
        buffer.vertices[buffer.vertexPos++] = y4;
        buffer.vertices[buffer.vertexPos++] = red;
        buffer.vertices[buffer.vertexPos++] = green;
        buffer.vertices[buffer.vertexPos++] = blue;
        
        Render.Index4(buffer);
    }
}