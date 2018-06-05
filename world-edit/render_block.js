class RenderBlock {
	static Side(buffer, side, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
		switch (side) {
			case WORLD_POSITIVE_X: RenderBlock.PositiveX(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d); break;
			case WORLD_POSITIVE_Y: RenderBlock.PositiveY(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d); break;
			case WORLD_POSITIVE_Z: RenderBlock.PositiveZ(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d); break;
			case WORLD_NEGATIVE_X: RenderBlock.NegativeX(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d); break;
			case WORLD_NEGATIVE_Y: RenderBlock.NegativeY(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d); break;
			case WORLD_NEGATIVE_Z: RenderBlock.NegativeZ(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d); break;
		}
	}
    static PositiveX(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
        buffer.vertices[buffer.vertex_pos++] = x + raise_a[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise_a[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_a[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
        buffer.vertices[buffer.vertex_pos++] = texture[0];
        buffer.vertices[buffer.vertex_pos++] = texture[1];
        
        buffer.vertices[buffer.vertex_pos++] = x + raise_b[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise_b[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_b[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
        buffer.vertices[buffer.vertex_pos++] = texture[2];
        buffer.vertices[buffer.vertex_pos++] = texture[1];
        
        buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
        buffer.vertices[buffer.vertex_pos++] = texture[2];
        buffer.vertices[buffer.vertex_pos++] = texture[3];
        
        buffer.vertices[buffer.vertex_pos++] = x + raise_c[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise_c[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_c[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
        buffer.vertices[buffer.vertex_pos++] = texture[0];
        buffer.vertices[buffer.vertex_pos++] = texture[3];
        
        Render.Index4(buffer);
    }
    static NegativeX(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
        buffer.vertices[buffer.vertex_pos++] = x + raise_a[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_a[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_a[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_c[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_c[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_c[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_d[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_b[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_b[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_b[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
        Render.Index4(buffer);
    }
    static PositiveY(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
		buffer.vertices[buffer.vertex_pos++] = x + raise_a[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_a[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_a[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_b[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_b[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_b[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_c[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_c[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_c[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
        Render.Index4(buffer);
    }
    static NegativeY(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
        buffer.vertices[buffer.vertex_pos++] = x + raise_a[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_a[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_a[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_c[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_c[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_c[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_d[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_b[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_b[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_b[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
        Render.Index4(buffer);
    }
    static PositiveZ(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
        buffer.vertices[buffer.vertex_pos++] = x + raise_b[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_b[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_b[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_c[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_c[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_c[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_a[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_a[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_a[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
        Render.Index4(buffer);
    }
    static NegativeZ(buffer, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
        buffer.vertices[buffer.vertex_pos++] = x + raise_a[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_a[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_a[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_c[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise_c[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_c[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
		buffer.vertices[buffer.vertex_pos++] = texture[0];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise_d[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[3];
		
		buffer.vertices[buffer.vertex_pos++] = x + raise_b[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise_b[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise_b[2];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
		buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
		buffer.vertices[buffer.vertex_pos++] = texture[2];
		buffer.vertices[buffer.vertex_pos++] = texture[1];
		
        Render.Index4(buffer);
    }
}