package graphics

import (
	"unsafe"
)

type Buffer struct {
	vao uint32
	vbo uint32
	ebo uint32

	Vertices unsafe.Pointer
	Indices  unsafe.Pointer
	vPos     unsafe.Pointer
	iPos     unsafe.Pointer

	index_offset uint32

	VertexLimit int
	IndexLimit  int
}

func NewBuffer(attributes []Attribute, vertexLim, indexLim int) *Buffer {
	b := new(Buffer)
	b.VertexLimit = 0
	for i := 0; i < len(attributes); i++ {
		b.VertexLimit += int(attributes[i].Size)
	}
	b.VertexLimit *= vertexLim
	b.IndexLimit = indexLim
	b.MakeDynamicVao(attributes)
	return b
}

func NewBufferCopied(attributes []Attribute, util *BufferUtil) *Buffer {
	b := new(Buffer)
	b.VertexLimit = util.VertexIndex
	b.IndexLimit = util.IndiceIndex
	b.MakeDynamicVao(attributes)
	b.Zero()
	b.Copy(util)
	return b
}

func NewStaticBuffer(attributes []Attribute, util *BufferUtil) *Buffer {
	b := new(Buffer)
	b.VertexLimit = util.VertexIndex
	b.IndexLimit = util.IndiceIndex
	b.MakeStaticVao(attributes, util.VertexData, util.IndexData)
	b.index_offset = 1
	return b
}

func (b *Buffer) Copy(util *BufferUtil) {
	for i := 0; i < b.VertexLimit; i++ {
		*(*float32)(b.vPos) = util.VertexData[i]
		b.vPos = unsafe.Pointer(uintptr(b.vPos) + Bytes4)
	}
	for i := 0; i < b.IndexLimit; i++ {
		*(*uint32)(b.iPos) = util.IndexData[i]
		b.iPos = unsafe.Pointer(uintptr(b.iPos) + Bytes4)
	}
	b.index_offset = 1
}

func (b *Buffer) Zero() {
	b.vPos = b.Vertices
	b.iPos = b.Indices
	b.index_offset = 0
}
