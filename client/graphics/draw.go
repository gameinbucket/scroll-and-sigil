package graphics

import (
	"unsafe"
)

const (
	Bytes4 = uintptr(4)
)

func luminosity(red, green, blue float32) float32 {
	return 0.2126*red + 0.7152*green + 0.0722*blue
}

func (b *Buffer) Index4() {
	*(*uint32)(b.iPos) = 0 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	*(*uint32)(b.iPos) = 1 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	*(*uint32)(b.iPos) = 2 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	*(*uint32)(b.iPos) = 2 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	*(*uint32)(b.iPos) = 3 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	*(*uint32)(b.iPos) = 0 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)

	b.index_offset += 4
}

func (b *BufferUtil) StaticIndex4() {
	b.IndexData[b.IndiceIndex] = 0 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 1 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 2 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 2 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 3 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 0 + b.IndexOffset
	b.IndiceIndex++

	b.IndexOffset += 4
}

func (b *BufferUtil) StaticIndexMirror4() {
	b.IndexData[b.IndiceIndex] = 1 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 2 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 3 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 3 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 0 + b.IndexOffset
	b.IndiceIndex++
	b.IndexData[b.IndiceIndex] = 1 + b.IndexOffset
	b.IndiceIndex++

	b.IndexOffset += 4
}

/* 2d draw */

func (b *Buffer) RenderLine(xA, yA, xB, yB, red, green, blue float32) {
	*(*float32)(b.vPos) = xA
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = yA
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = red
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = green
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = blue
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 1.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = xB
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = yB
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = red
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = green
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = blue
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 1.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*uint32)(b.iPos) = 0 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	*(*uint32)(b.iPos) = 1 + b.index_offset
	b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)

	b.index_offset += 2
}

func (b *Buffer) RenderRectangle(x, y, w, h, red, green, blue, alpha float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = red
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = green
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = blue
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = alpha
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + h
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = red
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = green
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = blue
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = alpha
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + w
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + h
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = red
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = green
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = blue
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = alpha
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + w
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = red
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = green
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = blue
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = alpha
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderImage(x, y, w, h, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + h
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + w
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + h
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + w
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

/* cube */

func (b *Buffer) RenderCubeZpos(x, y, z, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeZneg(x, y, z, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeXneg(x, y, z, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeXpos(x, y, z, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeYpos(x, y, z, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeYneg(x, y, z, left, top, right, bottom float32) {
	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = right
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = top
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = left
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = bottom
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

/* cube indexed */

func (b *Buffer) RenderCubeXposIndexed(x, y, z, width, height, index float32) {
	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeXnegIndexed(x, y, z, width, height, index float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeYposIndexed(x, y, z, width, height, index float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeYnegIndexed(x, y, z, width, height, index float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeZposIndexed(x, y, z, width, height, index float32) {
	*(*float32)(b.vPos) = x + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z + 1
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

func (b *Buffer) RenderCubeZnegIndexed(x, y, z, width, height, index float32) {
	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y + height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = height
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	*(*float32)(b.vPos) = x + width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = y
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = z
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = width
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = 0.0
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	*(*float32)(b.vPos) = index
	b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)

	b.Index4()
}

const stride = 8
const cube = stride * 4

func (b *Buffer) RenderModel(m *Model, red, green, blue float32) {
	for i := 0; i < len(m.Bones); i++ {
		mb := m.Bones[i]
		box := getCube(mb.Width, mb.Height, mb.Length)
		for i := 0; i < 6; i++ {
			color(&box[i], red, green, blue)
			translate(&box[i], mb.PlaneOffsetX, mb.PlaneOffsetY, mb.PlaneOffsetZ)
			rotateX(&box[i], mb.SinX, mb.CosX)
			rotateY(&box[i], mb.SinY, mb.CosY)
			translate(&box[i], mb.WorldX, mb.WorldY, mb.WorldZ)
			b.copy(&box[i])
			b.Index4()
		}
	}
}

func (b *Buffer) copy(vertices *[cube]float32) {
	for i := 0; i < cube; i++ {
		*(*float32)(b.vPos) = vertices[i]
		b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	}
}

func color(vertices *[cube]float32, red, green, blue float32) {
	for i := 0; i < cube; i += stride {
		vertices[i+3] = red
		vertices[i+4] = green
		vertices[i+5] = blue
	}
}

func translate(vertices *[cube]float32, x, y, z float32) {
	for i := 0; i < cube; i += stride {
		vertices[i] += x
		vertices[i+1] += y
		vertices[i+2] += z
	}
}

func rotateX(vertices *[cube]float32, sin, cos float32) {
	for i := 0; i < cube; i += stride {
		y := vertices[i+1]*cos - vertices[i+2]*sin
		z := vertices[i+1]*sin + vertices[i+2]*cos
		vertices[i+1] = y
		vertices[i+2] = z
	}
}

func rotateY(vertices *[cube]float32, sin, cos float32) {
	for i := 0; i < cube; i += stride {
		x := vertices[i]*cos + vertices[i+2]*sin
		z := vertices[i+2]*cos - vertices[i]*sin
		vertices[i] = x
		vertices[i+2] = z
	}
}

func getCube(x, y, z float32) [6][cube]float32 {
	return [6][cube]float32{
		// pos x
		{
			x, -y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			x, y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			x, y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			x, -y, z, 0.0, 0.0, 0.0, 0.0, 0.0},
		// neg x
		{
			-x, -y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, -y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, y, -z, 0.0, 0.0, 0.0, 0.0, 0.0},
		// pos y
		{
			-x, y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, y, -z, 0.0, 0.0, 0.0, 0.0, 0.0},
		// neg y
		{
			-x, -y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, -y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, -y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, -y, z, 0.0, 0.0, 0.0, 0.0, 0.0},
		// pos z
		{
			+x, -y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, y, z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, -y, z, 0.0, 0.0, 0.0, 0.0, 0.0},
		// neg z
		{
			-x, -y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			-x, y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, y, -z, 0.0, 0.0, 0.0, 0.0, 0.0,
			+x, -y, -z, 0.0, 0.0, 0.0, 0.0, 0.0}}
}
