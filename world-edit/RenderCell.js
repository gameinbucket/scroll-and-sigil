class RenderCell
{
	static Side(buffer, side, x, y, z, width, height, index)
	{
		switch (side)
		{
			case Map_PositiveX: RenderCell.PositiveX(buffer, x, y, z, width, height, index); break;
			case Map_PositiveY: RenderCell.PositiveY(buffer, x, y, z, width, height, index); break;
			case Map_PositiveZ: RenderCell.PositiveZ(buffer, x, y, z, width, height, index); break;
			case Map_NegativeX: RenderCell.NegativeX(buffer, x, y, z, width, height, index); break;
			case Map_NegativeY: RenderCell.NegativeY(buffer, x, y, z, width, height, index); break;
			case Map_NegativeZ: RenderCell.NegativeZ(buffer, x, y, z, width, height, index); break;
		}
	}
    static PositiveX(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertex_pos++] = x + 1;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z;
        buffer.vertices[buffer.vertex_pos++] = 0.0;
        buffer.vertices[buffer.vertex_pos++] = 0.0;
        buffer.vertices[buffer.vertex_pos++] = index;
        
        buffer.vertices[buffer.vertex_pos++] = x + 1;
        buffer.vertices[buffer.vertex_pos++] = y + width;
        buffer.vertices[buffer.vertex_pos++] = z;
        buffer.vertices[buffer.vertex_pos++] = width;
        buffer.vertices[buffer.vertex_pos++] = 0.0;
        buffer.vertices[buffer.vertex_pos++] = index;
        
        buffer.vertices[buffer.vertex_pos++] = x + 1;
        buffer.vertices[buffer.vertex_pos++] = y + width;
        buffer.vertices[buffer.vertex_pos++] = z + height;
        buffer.vertices[buffer.vertex_pos++] = width;
        buffer.vertices[buffer.vertex_pos++] = height;
        buffer.vertices[buffer.vertex_pos++] = index;
        
        buffer.vertices[buffer.vertex_pos++] = x + 1;
        buffer.vertices[buffer.vertex_pos++] = y;
        buffer.vertices[buffer.vertex_pos++] = z + height;
        buffer.vertices[buffer.vertex_pos++] = 0.0;
        buffer.vertices[buffer.vertex_pos++] = height;
        buffer.vertices[buffer.vertex_pos++] = index;

        Render.Index4(buffer);
    }

    static NegativeX(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + height;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + width;
		buffer.vertices[buffer.vertex_pos++] = z + height;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + width;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;
        
        Render.Index4(buffer);
    }

    static PositiveY(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + 1
		buffer.vertices[buffer.vertex_pos++] = z + width;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + height;
		buffer.vertices[buffer.vertex_pos++] = y + 1
		buffer.vertices[buffer.vertex_pos++] = z + width;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + height;
		buffer.vertices[buffer.vertex_pos++] = y + 1
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;
        
        Render.Index4(buffer);
    }

    static NegativeY(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + height;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + height;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + width;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + width;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = index;
        
        Render.Index4(buffer);
    }

    static PositiveZ(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertex_pos++] = x + width;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + width;
		buffer.vertices[buffer.vertex_pos++] = y + height;
		buffer.vertices[buffer.vertex_pos++] = z + 1
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + height;
		buffer.vertices[buffer.vertex_pos++] = z + 1
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z + 1
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;
        
        Render.Index4(buffer);
    }

    static NegativeZ(buffer, x, y, z, width, height, index)
    {
        buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x;
		buffer.vertices[buffer.vertex_pos++] = y + height;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + width;
		buffer.vertices[buffer.vertex_pos++] = y + height;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = height;
		buffer.vertices[buffer.vertex_pos++] = index;

		buffer.vertices[buffer.vertex_pos++] = x + width;
		buffer.vertices[buffer.vertex_pos++] = y;
		buffer.vertices[buffer.vertex_pos++] = z;
		buffer.vertices[buffer.vertex_pos++] = width;
		buffer.vertices[buffer.vertex_pos++] = 0.0;
		buffer.vertices[buffer.vertex_pos++] = index;
        
        Render.Index4(buffer);
    }
}