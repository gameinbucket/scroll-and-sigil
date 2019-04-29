package graphics

const (
	PosX = 0
	NegX = 1
	PosY = 2
	NegY = 3
	PosZ = 4
	NegZ = 5
)

func (b *BufferUtil) StaticRenderCube(
	side int,
	x, y, z,
	width, height, index,
	r0, g0, b0,
	r1, g1, b1,
	r2, g2, b2,
	r3, g3, b3 float32) {

	switch side {
	case PosX:
		b.VertexData[b.VertexIndex] = x + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++
	case NegX:
		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++
	case PosY:
		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++
	case NegY:
		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++
	case PosZ:
		b.VertexData[b.VertexIndex] = x + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z + 1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++
	case NegZ:
		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b1
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y + height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b2
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = height
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++

		b.VertexData[b.VertexIndex] = x + width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = y
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = z
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = r3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = g3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = b3
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = width
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = 0.0
		b.VertexIndex++
		b.VertexData[b.VertexIndex] = index
		b.VertexIndex++
	}

	if luminosity(r0, g0, b0)+luminosity(r2, g2, b2) < luminosity(r1, g1, b1)+luminosity(r3, g3, b3) {
		b.StaticIndexMirror4()
	} else {
		b.StaticIndex4()
	}
}
