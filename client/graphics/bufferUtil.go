package graphics

type BufferUtil struct {
	VertexIndex int
	IndiceIndex int
	IndexOffset uint32
	VertexData  []float32
	IndexData   []uint32
}

func NewBufferUtil(vertex_limit, index_limit int) *BufferUtil {
	b := new(BufferUtil)
	b.VertexData = make([]float32, vertex_limit)
	b.IndexData = make([]uint32, index_limit)
	return b
}

func (b *BufferUtil) Zero() {
	b.VertexIndex = 0
	b.IndiceIndex = 0
	b.IndexOffset = 0
}
