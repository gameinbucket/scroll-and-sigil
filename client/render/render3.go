package render

import "../graphics"

// RendSprite func
func RendSprite(b *graphics.RenderBuffer, x, y, z, sin, cos float32, sprite *Sprite) {
	sine := sprite.HalfWidth * sin
	cosine := sprite.HalfWidth * cos

	b.Vertices[b.VertexPos] = x - cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Left
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Bottom
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z - sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Right
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Bottom
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + sprite.Height
	b.VertexPos++
	b.Vertices[b.VertexPos] = z - sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Right
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Top
	b.VertexPos++

	b.Vertices[b.VertexPos] = x - cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + sprite.Height
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Left
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Top
	b.VertexPos++

	Index4(b)
}

// RendMirrorSprite func
func RendMirrorSprite(b *graphics.RenderBuffer, x, y, z, sin, cos float32, sprite *Sprite) {
	sine := sprite.HalfWidth * sin
	cosine := sprite.HalfWidth * cos

	b.Vertices[b.VertexPos] = x - cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Right
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Bottom
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z - sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Left
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Bottom
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + sprite.Height
	b.VertexPos++
	b.Vertices[b.VertexPos] = z - sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Left
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Top
	b.VertexPos++

	b.Vertices[b.VertexPos] = x - cosine
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + sprite.Height
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + sine
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Right
	b.VertexPos++
	b.Vertices[b.VertexPos] = sprite.Top
	b.VertexPos++

	Index4(b)
}
