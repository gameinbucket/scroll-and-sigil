class RenderBlock
{
	static Side(buffer, side, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
	{
		switch (side)
		{
			case WORLD_POSITIVE_X: RenderBlock.PositiveX(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3); break;
			case WORLD_POSITIVE_Y: RenderBlock.PositiveY(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3); break;
			case WORLD_POSITIVE_Z: RenderBlock.PositiveZ(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3); break;
			case WORLD_NEGATIVE_X: RenderBlock.NegativeX(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3); break;
			case WORLD_NEGATIVE_Y: RenderBlock.NegativeY(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3); break;
			case WORLD_NEGATIVE_Z: RenderBlock.NegativeZ(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3); break;
		}
	}
    static PositiveX(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
    {
        buffer.vertices[buffer.vertex_pos++] = x + raise0[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise0[1];
        buffer.vertices[buffer.vertex_pos++] = z + raise0[2];
        buffer.vertices[buffer.vertex_pos++] = u;
        buffer.vertices[buffer.vertex_pos++] = v;
        
        buffer.vertices[buffer.vertex_pos++] = x + raise1[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise1[1] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = z + raise1[2];
        buffer.vertices[buffer.vertex_pos++] = s;
        buffer.vertices[buffer.vertex_pos++] = v;
        
        buffer.vertices[buffer.vertex_pos++] = x + raise2[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise2[1] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = z + raise2[2] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = s;
        buffer.vertices[buffer.vertex_pos++] = t;
        
        buffer.vertices[buffer.vertex_pos++] = x + raise3[0] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + raise3[1];
        buffer.vertices[buffer.vertex_pos++] = z + raise3[2] + 1.0;
        buffer.vertices[buffer.vertex_pos++] = u;
        buffer.vertices[buffer.vertex_pos++] = t;
        
        Render.Index4(buffer);
    }

    static NegativeX(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
    {
        buffer.vertices[buffer.vertex_pos++] = x + raise0[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise0[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise0[2];
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise1[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise1[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise1[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise2[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise2[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise2[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise3[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise3[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise3[2];
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }

    static PositiveY(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
    {
        buffer.vertices[buffer.vertex_pos++] = x + raise0[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise0[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise0[2];
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise1[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise1[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise1[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise2[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise2[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise2[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise3[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise3[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise3[2];
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }

    static NegativeY(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
    {
        buffer.vertices[buffer.vertex_pos++] = x + raise0[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise0[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise0[2];
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise1[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise1[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise1[2];
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise2[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise2[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise2[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise3[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise3[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise3[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
        Render.Index4(buffer);
    }

    static PositiveZ(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
    {
        buffer.vertices[buffer.vertex_pos++] = x + raise0[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise0[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise0[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise1[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise1[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise1[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise2[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise2[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise2[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise3[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise3[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise3[2] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }

    static NegativeZ(buffer, x, y, z, u, v, s, t, raise0, raise1, raise2, raise3)
    {
        buffer.vertices[buffer.vertex_pos++] = x + raise0[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise0[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise0[2];
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise1[0];
		buffer.vertices[buffer.vertex_pos++] = y + raise1[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise1[2];
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise2[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise2[1] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + raise2[2];
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + raise3[0] + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + raise3[1];
		buffer.vertices[buffer.vertex_pos++] = z + raise3[2];
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }
}