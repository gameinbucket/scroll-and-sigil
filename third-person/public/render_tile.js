class RenderTile {
	static Side(buffer, side, x, y, z, texture, rgb_a, rgb_b, rgb_c, rgb_d) {
		switch (side) {
			case WORLD_POSITIVE_X:
				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]
				break
			case WORLD_NEGATIVE_X:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
			case WORLD_POSITIVE_Y:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
			case WORLD_NEGATIVE_Y:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]
				break
			case WORLD_POSITIVE_Z:
				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z + 1.0
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
			case WORLD_NEGATIVE_Z:
				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_a[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_a[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[1]

				buffer.vertices[buffer.vertex_pos++] = x
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_b[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_b[2]
				buffer.vertices[buffer.vertex_pos++] = texture[0]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y + 1.0
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_c[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_c[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[3]

				buffer.vertices[buffer.vertex_pos++] = x + 1.0
				buffer.vertices[buffer.vertex_pos++] = y
				buffer.vertices[buffer.vertex_pos++] = z
				buffer.vertices[buffer.vertex_pos++] = rgb_d[0]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[1]
				buffer.vertices[buffer.vertex_pos++] = rgb_d[2]
				buffer.vertices[buffer.vertex_pos++] = texture[2]
				buffer.vertices[buffer.vertex_pos++] = texture[1]
				break
		}

		if (Render.Lumin(rgb_a) + Render.Lumin(rgb_c) < Render.Lumin(rgb_b) + Render.Lumin(rgb_d)) {
			Render.MirrorIndex4(buffer)
		} else {
			Render.Index4(buffer)
		}
	}
}
