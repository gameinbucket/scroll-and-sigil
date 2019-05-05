package render

import "../graphics"

// RendTilePosX func
func RendTilePosX(b *graphics.RenderBuffer, x, y, z float32, texture *[4]float32, rgb *[4][3]float32) {
	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	if Lumin(&rgb[0])+Lumin(&rgb[2]) < Lumin(&rgb[1])+Lumin(&rgb[3]) {
		MirrorIndex4(b)
	} else {
		Index4(b)
	}
}

// RendTileNegX func
func RendTileNegX(b *graphics.RenderBuffer, x, y, z float32, texture *[4]float32, rgb *[4][3]float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	if Lumin(&rgb[0])+Lumin(&rgb[2]) < Lumin(&rgb[1])+Lumin(&rgb[3]) {
		MirrorIndex4(b)
	} else {
		Index4(b)
	}
}

// RendTilePosY func
func RendTilePosY(b *graphics.RenderBuffer, x, y, z float32, texture *[4]float32, rgb *[4][3]float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	if Lumin(&rgb[0])+Lumin(&rgb[2]) < Lumin(&rgb[1])+Lumin(&rgb[3]) {
		MirrorIndex4(b)
	} else {
		Index4(b)
	}
}

// RendTileNegY func
func RendTileNegY(b *graphics.RenderBuffer, x, y, z float32, texture *[4]float32, rgb *[4][3]float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	if Lumin(&rgb[0])+Lumin(&rgb[2]) < Lumin(&rgb[1])+Lumin(&rgb[3]) {
		MirrorIndex4(b)
	} else {
		Index4(b)
	}
}

// RendTilePosZ func
func RendTilePosZ(b *graphics.RenderBuffer, x, y, z float32, texture *[4]float32, rgb *[4][3]float32) {
	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	if Lumin(&rgb[0])+Lumin(&rgb[2]) < Lumin(&rgb[1])+Lumin(&rgb[3]) {
		MirrorIndex4(b)
	} else {
		Index4(b)
	}
}

// RendTileNegZ func
func RendTileNegZ(b *graphics.RenderBuffer, x, y, z float32, texture *[4]float32, rgb *[4][3]float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[0][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[1][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[1]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[2][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + 1.0
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = z
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][1]
	b.VertexPos++
	b.Vertices[b.VertexPos] = rgb[3][2]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[0]
	b.VertexPos++
	b.Vertices[b.VertexPos] = texture[3]
	b.VertexPos++

	if Lumin(&rgb[0])+Lumin(&rgb[2]) < Lumin(&rgb[1])+Lumin(&rgb[3]) {
		MirrorIndex4(b)
	} else {
		Index4(b)
	}
}
