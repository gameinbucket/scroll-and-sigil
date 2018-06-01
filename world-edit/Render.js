class Render {
    static Index4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3;
        buffer.indices[buffer.index_pos++] = buffer.index_offset;
        buffer.index_offset += 4;
    }
    static Image(buffer, x, y, width, height, left, top, right, bottom) {
        buffer.vertices[buffer.vertex_pos++] = x;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = left;
        buffer.vertices[buffer.vertex_pos++] = bottom;
        
        buffer.vertices[buffer.vertex_pos++] = x + width;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = right;
        buffer.vertices[buffer.vertex_pos++] = bottom;
        
        buffer.vertices[buffer.vertex_pos++] = x + width;
        buffer.vertices[buffer.vertex_pos++] = y + height;
        buffer.vertices[buffer.vertex_pos++] = right;
        buffer.vertices[buffer.vertex_pos++] = top;
        
        buffer.vertices[buffer.vertex_pos++] = x;
        buffer.vertices[buffer.vertex_pos++] = y + height;
        buffer.vertices[buffer.vertex_pos++] = left;
        buffer.vertices[buffer.vertex_pos++] = top;
        
        Render.Index4(buffer);
    }
    static Rectangle(buffer, x, y, width, height, red, green, blue) {
        buffer.vertices[buffer.vertex_pos++] = x;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = red;
        buffer.vertices[buffer.vertex_pos++] = green;
        buffer.vertices[buffer.vertex_pos++] = blue;
        
        buffer.vertices[buffer.vertex_pos++] = x + width;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = red;
        buffer.vertices[buffer.vertex_pos++] = green;
        buffer.vertices[buffer.vertex_pos++] = blue;
        
        buffer.vertices[buffer.vertex_pos++] = x + width;
        buffer.vertices[buffer.vertex_pos++] = y + height;
        buffer.vertices[buffer.vertex_pos++] = red;
        buffer.vertices[buffer.vertex_pos++] = green;
        buffer.vertices[buffer.vertex_pos++] = blue;
        
        buffer.vertices[buffer.vertex_pos++] = x;
        buffer.vertices[buffer.vertex_pos++] = y + height;
        buffer.vertices[buffer.vertex_pos++] = red;
        buffer.vertices[buffer.vertex_pos++] = green;
        buffer.vertices[buffer.vertex_pos++] = blue;
        
        Render.Index4(buffer);
    }
    static Circle(buffer, x, y, radius, red, green, blue) {
        const points = 32;
        const tau = Math.PI * 2.0;
        const slice = tau / points;
        
        let firstIndex = buffer.index_offset;
        buffer.vertices[buffer.vertex_pos++] = x;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = red;
        buffer.vertices[buffer.vertex_pos++] = green;
        buffer.vertices[buffer.vertex_pos++] = blue;
        buffer.index_offset++;

        let radian = 0;
        while (radian < tau)
        {
            buffer.vertices[buffer.vertex_pos++] = x + Math.cos(radian) * radius;
            buffer.vertices[buffer.vertex_pos++] = y + Math.sin(radian) * radius;
            buffer.vertices[buffer.vertex_pos++] = red;
            buffer.vertices[buffer.vertex_pos++] = green;
            buffer.vertices[buffer.vertex_pos++] = blue;

            buffer.indices[buffer.index_pos++] = firstIndex;
            buffer.indices[buffer.index_pos++] = buffer.index_offset;
            buffer.indices[buffer.index_pos++] = buffer.index_offset + 1;
            buffer.index_offset++;

            radian += slice;
        }
        buffer.indices[buffer.index_pos - 1] = firstIndex + 1;
    }
    static Sprite(buffer, x, y, z, sin, cos, sprite) {
        let sine = sprite.width * sin;
        let cosine = sprite.width * cos;

        buffer.vertices[buffer.vertex_pos++] = x - cosine;
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height;
        buffer.vertices[buffer.vertex_pos++] = z + sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.left;
        buffer.vertices[buffer.vertex_pos++] = sprite.top;
        
        buffer.vertices[buffer.vertex_pos++] = x - cosine;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z + sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.left;
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom;

        buffer.vertices[buffer.vertex_pos++] = x + cosine;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z - sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.right;
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom;

        buffer.vertices[buffer.vertex_pos++] = x + cosine;
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height;
        buffer.vertices[buffer.vertex_pos++] = z - sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.right;
        buffer.vertices[buffer.vertex_pos++] = sprite.top;
        
        Render.Index4(buffer);
    }
    static MirrorSprite(buffer, x, y, z, sin, cos, sprite) {
        let sine = sprite.width * sin;
        let cosine = sprite.width * cos;

        buffer.vertices[buffer.vertex_pos++] = x - cosine;
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height;
        buffer.vertices[buffer.vertex_pos++] = z + sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.right;
        buffer.vertices[buffer.vertex_pos++] = sprite.top;
        
        buffer.vertices[buffer.vertex_pos++] = x - cosine;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z + sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.right;
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom;

        buffer.vertices[buffer.vertex_pos++] = x + cosine;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z - sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.left;
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom;

        buffer.vertices[buffer.vertex_pos++] = x + cosine;
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height;
        buffer.vertices[buffer.vertex_pos++] = z - sine;
        buffer.vertices[buffer.vertex_pos++] = sprite.left;
        buffer.vertices[buffer.vertex_pos++] = sprite.top;
        
        Render.Index4(buffer);
    }
}