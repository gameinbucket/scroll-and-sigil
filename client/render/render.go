package render

import (
	"strings"

	"../graphics"
)

// Constants
const (
	Font       = "0123456789abcdefghijklmnopqrstuvwxyz%"
	FontWidth  = 9
	FontHeight = 9
	FontGrid   = 7
	FontColumn = float32(FontWidth) / 64.0
	FontRow    = float32(FontHeight) / 64.0
)

// Lumin func
func Lumin(rgb *[3]float32) float32 {
	return 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
}

// PackRgb func
func PackRgb(red, green, blue int32) int32 {
	return (red << 16) | (green << 8) | blue
}

// UnpackRgb func
func UnpackRgb(rgb int32) (int32, int32, int32) {
	red := (rgb >> 16) & 255
	green := (rgb >> 8) & 255
	blue := rgb & 255
	return red, green, blue
}

// Index4 func
func Index4(b *graphics.RenderBuffer) {
	b.Indices[b.IndexPos] = b.IndexOffset
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 1
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 2
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 2
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 3
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset
	b.IndexPos++

	b.IndexOffset += 4
}

// MirrorIndex4 func
func MirrorIndex4(b *graphics.RenderBuffer) {
	b.Indices[b.IndexPos] = b.IndexOffset + 1
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 2
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 3
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 3
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset
	b.IndexPos++
	b.Indices[b.IndexPos] = b.IndexOffset + 1
	b.IndexPos++

	b.IndexOffset += 4
}

// Screen func
func Screen(b *graphics.RenderBuffer, x, y, width, height float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + width
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + width
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + height
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + height
	b.VertexPos++

	Index4(b)
}

// Image func
func Image(b *graphics.RenderBuffer, x, y, width, height, left, top, right, bottom float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = left
	b.VertexPos++
	b.Vertices[b.VertexPos] = bottom
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + width
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = right
	b.VertexPos++
	b.Vertices[b.VertexPos] = bottom
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + width
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + height
	b.VertexPos++
	b.Vertices[b.VertexPos] = right
	b.VertexPos++
	b.Vertices[b.VertexPos] = top
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + height
	b.VertexPos++
	b.Vertices[b.VertexPos] = left
	b.VertexPos++
	b.Vertices[b.VertexPos] = top
	b.VertexPos++

	Index4(b)
}

// Rectangle func
func Rectangle(b *graphics.RenderBuffer, x, y, width, height, red, green, blue float32) {
	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = red
	b.VertexPos++
	b.Vertices[b.VertexPos] = green
	b.VertexPos++
	b.Vertices[b.VertexPos] = blue
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + width
	b.VertexPos++
	b.Vertices[b.VertexPos] = y
	b.VertexPos++
	b.Vertices[b.VertexPos] = red
	b.VertexPos++
	b.Vertices[b.VertexPos] = green
	b.VertexPos++
	b.Vertices[b.VertexPos] = blue
	b.VertexPos++

	b.Vertices[b.VertexPos] = x + width
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + height
	b.VertexPos++
	b.Vertices[b.VertexPos] = red
	b.VertexPos++
	b.Vertices[b.VertexPos] = green
	b.VertexPos++
	b.Vertices[b.VertexPos] = blue
	b.VertexPos++

	b.Vertices[b.VertexPos] = x
	b.VertexPos++
	b.Vertices[b.VertexPos] = y + height
	b.VertexPos++
	b.Vertices[b.VertexPos] = red
	b.VertexPos++
	b.Vertices[b.VertexPos] = green
	b.VertexPos++
	b.Vertices[b.VertexPos] = blue
	b.VertexPos++

	Index4(b)
}

// Print func
func Print(b *graphics.RenderBuffer, x, y float32, text string, scale int) {
	widthScale := float32(FontWidth * scale)
	heightScale := float32(FontHeight * scale)
	xx := x
	yy := y
	num := len(text)
	for i := 0; i < num; i++ {
		c := text[i]
		if c == ' ' {
			xx += widthScale
			continue
		} else if c == '\n' {
			xx = x
			yy += heightScale
			continue
		}
		loc := strings.IndexByte(Font, c)
		tx1 := float32(loc%FontGrid) * FontColumn
		ty1 := float32(loc/FontGrid) * FontRow
		tx2 := tx1 + FontColumn
		ty2 := ty1 + FontRow
		Image(b, xx, yy, widthScale, heightScale, tx1, ty1, tx2, ty2)
		xx += widthScale
	}
}
