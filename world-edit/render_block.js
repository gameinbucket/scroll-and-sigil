class RenderBlock {
	static Lumin(rgb) {
		return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
	}
	static Side(buffer, side, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d, raise_a, raise_b, raise_c, raise_d) {
		switch (side) {
		case WORLD_POSITIVE_X: 
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
			buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_c[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_c[1];
			buffer.vertices[buffer.vertex_pos++] = z + raise_c[2] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
			buffer.vertices[buffer.vertex_pos++] = texture[0];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			break;
		case WORLD_NEGATIVE_X:
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
			buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
			buffer.vertices[buffer.vertex_pos++] = texture[0];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_d[0];
			buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_b[0];
			buffer.vertices[buffer.vertex_pos++] = y + raise_b[1] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = z + raise_b[2];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[1];
			break;
		case WORLD_POSITIVE_Y:
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
			buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_c[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_c[1] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = z + raise_c[2];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[1];
			break;
		case WORLD_NEGATIVE_Y:
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
			buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[1];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_d[1];
			buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_b[0];
			buffer.vertices[buffer.vertex_pos++] = y + raise_b[1];
			buffer.vertices[buffer.vertex_pos++] = z + raise_b[2] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
			buffer.vertices[buffer.vertex_pos++] = texture[0];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			break;
		case WORLD_POSITIVE_Z:
			buffer.vertices[buffer.vertex_pos++] = x + raise_b[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_b[1];
			buffer.vertices[buffer.vertex_pos++] = z + raise_b[2] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = rgb_a[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_a[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_a[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[1];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = z + raise_d[2] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
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
			buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
			buffer.vertices[buffer.vertex_pos++] = texture[0];
			buffer.vertices[buffer.vertex_pos++] = texture[1];
			break;
		case WORLD_NEGATIVE_Z:
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
			buffer.vertices[buffer.vertex_pos++] = rgb_b[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_b[2];
			buffer.vertices[buffer.vertex_pos++] = texture[0];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_d[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_d[1] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = z + raise_d[2];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_c[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[3];
			
			buffer.vertices[buffer.vertex_pos++] = x + raise_b[0] + 1.0;
			buffer.vertices[buffer.vertex_pos++] = y + raise_b[1];
			buffer.vertices[buffer.vertex_pos++] = z + raise_b[2];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[0];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[1];
			buffer.vertices[buffer.vertex_pos++] = rgb_d[2];
			buffer.vertices[buffer.vertex_pos++] = texture[2];
			buffer.vertices[buffer.vertex_pos++] = texture[1];
			break;
		}

        if (RenderBlock.Lumin(rgb_a) + RenderBlock.Lumin(rgb_c) < RenderBlock.Lumin(rgb_b) + RenderBlock.Lumin(rgb_d)) {
			Render.MirrorIndex4(buffer);
		} else {
			Render.Index4(buffer);
		}
    }
}