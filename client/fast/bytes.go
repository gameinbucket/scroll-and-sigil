package fast

import "unsafe"

// ByteReader struct
type ByteReader struct {
	stream []byte
	dex    int64
}

// ByteReaderInit func
func ByteReaderInit(stream []byte) *ByteReader {
	reader := &ByteReader{}
	reader.stream = stream
	return reader
}

// GetByte func
func (me *ByteReader) GetByte() byte {
	x := me.stream[me.dex]
	me.dex++
	return x
}

// GetInt8 func
func (me *ByteReader) GetInt8() int8 {
	x := me.stream[me.dex]
	me.dex++
	return int8(x)
}

// GetUint8 func
func (me *ByteReader) GetUint8() uint8 {
	x := me.stream[me.dex]
	me.dex++
	return uint8(x)
}

// GetUint32 func
func (me *ByteReader) GetUint32() uint32 {
	b0 := me.stream[me.dex]
	b1 := me.stream[me.dex+1]
	b2 := me.stream[me.dex+2]
	b3 := me.stream[me.dex+3]
	me.dex += 4
	return uint32(b3)<<24 | uint32(b2)<<16 | uint32(b1)<<8 | uint32(b0)
}

// GetFloat32 func
func (me *ByteReader) GetFloat32() float32 {
	b0 := me.stream[me.dex]
	b1 := me.stream[me.dex+1]
	b2 := me.stream[me.dex+2]
	b3 := me.stream[me.dex+3]
	x := uint32(b3)<<24 | uint32(b2)<<16 | uint32(b1)<<8 | uint32(b0)
	me.dex += 4
	return *(*float32)(unsafe.Pointer(&x))
}
