class Render {
    static Lumin(rgb) {
		return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }
    static PackRgb(red, green, blue) {
		return (red << 16) | (green << 8) | blue;
    }
    static UnpackRgb(rgb) {
        let red = (rgb >> 16) & 255;
        let green = (rgb >> 8) & 255;
        let blue = rgb & 255;
		return [red, green, blue];
    }
    static Index4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3;
        buffer.indices[buffer.index_pos++] = buffer.index_offset;
        buffer.index_offset += 4;
    }
    static MirrorIndex4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3;
        buffer.indices[buffer.index_pos++] = buffer.index_offset;
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1;
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
    static Sprite(buffer, x, y, z, mv, sprite) {

        let right = [mv[0], mv[4], mv[8]];
        let up = [mv[1], mv[5], mv[9]];
        
        // let look = [mv[2], mv[6], mv[10]];
        // let xx = (1.0 - look_x);
        // let yy = (1.0 - look_y);
        // let zz = -look_z;

        let rpu_x = right[0] * sprite.width + up[0] * sprite.height;
        let rpu_y = right[1] * sprite.width + up[1] * sprite.height;
        let rpu_z = right[2] * sprite.width + up[2] * sprite.height;

        let rmu_x = right[0] * sprite.width - up[0] * sprite.height;
        let rmu_y = right[1] * sprite.width - up[1] * sprite.height;
        let rmu_z = right[2] * sprite.width - up[2] * sprite.height;
        
        buffer.vertices[buffer.vertex_pos++] = x - rmu_x;
        buffer.vertices[buffer.vertex_pos++] = y - rmu_y;
        buffer.vertices[buffer.vertex_pos++] = z - rmu_z;
        buffer.vertices[buffer.vertex_pos++] = sprite.left;
        buffer.vertices[buffer.vertex_pos++] = sprite.top;
        
        buffer.vertices[buffer.vertex_pos++] = x - rpu_x;
        buffer.vertices[buffer.vertex_pos++] = y - rpu_y;
        buffer.vertices[buffer.vertex_pos++] = z - rpu_z;
        buffer.vertices[buffer.vertex_pos++] = sprite.left;
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom;
        
        buffer.vertices[buffer.vertex_pos++] = x + rmu_x;
        buffer.vertices[buffer.vertex_pos++] = y + rmu_y;
        buffer.vertices[buffer.vertex_pos++] = z + rmu_z;
        buffer.vertices[buffer.vertex_pos++] = sprite.right;
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom;

        buffer.vertices[buffer.vertex_pos++] = x + rpu_x;
        buffer.vertices[buffer.vertex_pos++] = y + rpu_y;
        buffer.vertices[buffer.vertex_pos++] = z + rpu_z;
        buffer.vertices[buffer.vertex_pos++] = sprite.right;
        buffer.vertices[buffer.vertex_pos++] = sprite.top;
        
        Render.Index4(buffer);
    }
    static MirrorSprite(buffer, x, y, z, look_x, look_y, look_z, sprite) {
        let sine = sprite.width * look_x;
        let cosine = sprite.width * look_z;

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