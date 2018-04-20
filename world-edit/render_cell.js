class RenderCell
{
	static Side(buffer, side, x, y, z, u, v, s, t)
	{
		switch (side)
		{
			case Map_PositiveX: RenderCell.PositiveX(buffer, x, y, z, u, v, s, t); break;
			case Map_PositiveY: RenderCell.PositiveY(buffer, x, y, z, u, v, s, t); break;
			case Map_PositiveZ: RenderCell.PositiveZ(buffer, x, y, z, u, v, s, t); break;
			case Map_NegativeX: RenderCell.NegativeX(buffer, x, y, z, u, v, s, t); break;
			case Map_NegativeY: RenderCell.NegativeY(buffer, x, y, z, u, v, s, t); break;
			case Map_NegativeZ: RenderCell.NegativeZ(buffer, x, y, z, u, v, s, t); break;
		}
	}
    static PositiveX(buffer, x, y, z, u, v, s, t)
    {
        buffer.vertices[buffer.vertex_pos++] = x + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z;
        buffer.vertices[buffer.vertex_pos++] = u;
        buffer.vertices[buffer.vertex_pos++] = v;
        
        buffer.vertices[buffer.vertex_pos++] = x + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + 1.0;
        buffer.vertices[buffer.vertex_pos++] = z;
        buffer.vertices[buffer.vertex_pos++] = s;
        buffer.vertices[buffer.vertex_pos++] = v;
        
        buffer.vertices[buffer.vertex_pos++] = x + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y + 1.0;
        buffer.vertices[buffer.vertex_pos++] = z + 1.0;
        buffer.vertices[buffer.vertex_pos++] = s;
        buffer.vertices[buffer.vertex_pos++] = t;
        
        buffer.vertices[buffer.vertex_pos++] = x + 1.0;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z + 1.0;
        buffer.vertices[buffer.vertex_pos++] = u;
        buffer.vertices[buffer.vertex_pos++] = t;
        
        Render.Index4(buffer);
    }

    static NegativeX(buffer, x, y, z, u, v, s, t)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }

    static PositiveY(buffer, x, y, z, u, v, s, t)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = s;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = t;
		buffer.vertices[buffer.vertex_pos++] = s;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = t;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }

    static NegativeY(buffer, x, y, z, u, v, s, t)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = t;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = t;
		buffer.vertices[buffer.vertex_pos++] = s;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = s;
		
        Render.Index4(buffer);
    }

    static PositiveZ(buffer, x, y, z, u, v, s, t)
    {
        buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1.0;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }

    static NegativeZ(buffer, x, y, z, u, v, s, t)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = v;
		
		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = u;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y + 1.0;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = t;
		
		buffer.vertices[buffer.vertex_pos++] = x + 1.0;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = s;
		buffer.vertices[buffer.vertex_pos++] = v;
		
        Render.Index4(buffer);
    }
}