package graphics

import (
	"fmt"
	"image"
	"image/draw"
	_ "image/png"
	"io/ioutil"
	"math"
	"os"
	"strings"
	"unsafe"

	"github.com/go-gl/gl/v3.3-core/gl"
)

type Attribute struct {
	Typ  uint32
	Size int32
}

const size32 = 4

var (
	res = "./res/"

	Mv  = make([]float32, 16)
	Mvp = make([]float32, 16)

	program uint32
)

func SetClearColor(red, green, blue float32) {
	gl.ClearColor(red, green, blue, 1.0)
}

func ClearColor() {
	gl.Clear(gl.COLOR_BUFFER_BIT)
}

func ClearDepth() {
	gl.Clear(gl.DEPTH_BUFFER_BIT)
}

func ClearColorDepth() {
	gl.Clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

func SetTexture0(id uint32) {
	gl.ActiveTexture(gl.TEXTURE0)
	gl.BindTexture(gl.TEXTURE_2D, id)
}

func SetTextureArray0(id uint32) {
	gl.ActiveTexture(gl.TEXTURE0)
	gl.BindTexture(gl.TEXTURE_2D_ARRAY, id)
}

func SetProgram(prog uint32) {
	program = prog
	gl.UseProgram(program)
}

func (f *Frame) Framebuffer() {
}

func SetFramebuffer(id uint32) {
	gl.BindFramebuffer(gl.FRAMEBUFFER, id)
}

func (f *Frame) UpdateFramebuffer() {
}

func SetView(x, y, width, height int32) {
	gl.Viewport(x, y, width, height)
	gl.Scissor(x, y, width, height)
}

func (b *Buffer) BindVao() {
	gl.BindVertexArray(b.vao)
}

func DrawRange(start unsafe.Pointer, count int32) {
	if count == 0 {
		return
	}
	gl.DrawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, start)
}

func (b *Buffer) Draw() {
	if b.index_offset == 0 {
		return
	}
	gl.BindVertexArray(b.vao)
	gl.DrawElements(gl.TRIANGLES, int32((uintptr(b.iPos)-uintptr(b.Indices))>>2), gl.UNSIGNED_INT, nil)
}

func (b *Buffer) StaticDraw() {
	if b.index_offset == 0 {
		return
	}
	gl.BindVertexArray(b.vao)
	gl.DrawElements(gl.TRIANGLES, int32(b.IndexLimit), gl.UNSIGNED_INT, nil)
}

func (b *Buffer) DrawLines() {
	gl.BindVertexArray(b.vao)
	gl.DrawElements(gl.LINES, int32((uintptr(b.iPos)-uintptr(b.Indices))>>2), gl.UNSIGNED_INT, nil)
}

func SetOrthographic(orthographic []float32, x, y float32) {
	Identity(Mv)
	Translate(Mv, x, y, 0)
	Multiply(Mvp, orthographic, Mv)
}

func SetPerspective(perspective []float32, x, y, z, rx, ry float32) {
	Identity(Mv)
	if rx != 0.0 {
		sin := float32(math.Sin(float64(rx)))
		cos := float32(math.Cos(float64(rx)))
		RotateX(Mv, sin, cos)
	}
	if ry != 0.0 {
		sin := float32(math.Sin(float64(ry)))
		cos := float32(math.Cos(float64(ry)))
		RotateY(Mv, sin, cos)
	}
	Translate(Mv, x, y, z)
	Multiply(Mvp, perspective, Mv)
}

func SetMVP() {
	gl.UniformMatrix4fv(gl.GetUniformLocation(program, gl.Str("u_mvp\x00")), 1, false, &Mvp[0])
}

func (b *Buffer) MakeDynamicVao(attributes []Attribute) {
	if b.VertexLimit == 0 {
		return
	}
	gl.GenVertexArrays(1, &b.vao)
	gl.BindVertexArray(b.vao)

	gl.GenBuffers(1, &b.vbo)
	gl.BindBuffer(gl.ARRAY_BUFFER, b.vbo)
	gl.BufferStorage(gl.ARRAY_BUFFER, b.VertexLimit*size32, nil, gl.MAP_WRITE_BIT|gl.MAP_PERSISTENT_BIT|gl.MAP_COHERENT_BIT)
	b.Vertices = gl.MapBufferRange(gl.ARRAY_BUFFER, 0, b.VertexLimit*size32, gl.MAP_WRITE_BIT|gl.MAP_PERSISTENT_BIT|gl.MAP_COHERENT_BIT)

	gl.GenBuffers(1, &b.ebo)
	gl.BindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.ebo)
	gl.BufferStorage(gl.ELEMENT_ARRAY_BUFFER, b.IndexLimit*size32, nil, gl.MAP_WRITE_BIT|gl.MAP_PERSISTENT_BIT|gl.MAP_COHERENT_BIT)
	b.Indices = gl.MapBufferRange(gl.ELEMENT_ARRAY_BUFFER, 0, b.IndexLimit*size32, gl.MAP_WRITE_BIT|gl.MAP_PERSISTENT_BIT|gl.MAP_COHERENT_BIT)

	bindVaoAttributes(attributes)
}

func (b *Buffer) MakeStaticVao(attributes []Attribute, vertexData []float32, indexData []uint32) {
	if b.VertexLimit == 0 {
		return
	}
	gl.GenVertexArrays(1, &b.vao)
	gl.BindVertexArray(b.vao)

	gl.GenBuffers(1, &b.vbo)
	gl.BindBuffer(gl.ARRAY_BUFFER, b.vbo)
	gl.BufferData(
		gl.ARRAY_BUFFER,
		b.VertexLimit*size32,
		unsafe.Pointer(&vertexData[0]),
		gl.STATIC_DRAW)

	gl.GenBuffers(1, &b.ebo)
	gl.BindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.ebo)
	gl.BufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		b.IndexLimit*size32,
		unsafe.Pointer(&indexData[0]),
		gl.STATIC_DRAW)

	bindVaoAttributes(attributes)
}

func bindVaoAttributes(attributes []Attribute) {

	stride := int32(0)
	for i := 0; i < len(attributes); i++ {
		stride += attributes[i].Size
	}
	stride *= size32

	offset := 0
	index := uint32(0)
	for i := 0; i < len(attributes); i++ {
		gl.VertexAttribPointer(index, attributes[i].Size, attributes[i].Typ, false, stride, gl.PtrOffset(offset))
		gl.EnableVertexAttribArray(index)
		index++
		offset += int(attributes[i].Size) * size32
	}

	gl.BindVertexArray(0)
	gl.BindBuffer(gl.ARRAY_BUFFER, 0)
	gl.BindBuffer(gl.ELEMENT_ARRAY_BUFFER, 0)

	err := gl.GetError()
	if err != gl.NO_ERROR {
		fmt.Printf("make vao gl get error 0x%x\n", err)
	}
}

func makeShader(file string, shaderType uint32) uint32 {
	b, err := ioutil.ReadFile(file)

	if err != nil {
		fmt.Print(err)
		os.Exit(1)
	}

	shader := gl.CreateShader(shaderType)
	source, free := gl.Strs(string(b) + "\x00")
	gl.ShaderSource(shader, 1, source, nil)
	free()
	gl.CompileShader(shader)

	var status int32
	gl.GetShaderiv(shader, gl.COMPILE_STATUS, &status)
	if status == gl.FALSE {
		var logLength int32
		gl.GetShaderiv(shader, gl.INFO_LOG_LENGTH, &logLength)
		log := strings.Repeat("\x00", int(logLength+1))
		gl.GetShaderInfoLog(shader, logLength, nil, gl.Str(log))
		fmt.Println("shader error " + log)
		os.Exit(1)
	}

	return shader
}

func MakeProgram(name string, isPost bool) uint32 {
	var vertex uint32

	if isPost {
		vertex = makeShader(res+"screen_space.v", gl.VERTEX_SHADER)
	} else {
		vertex = makeShader(res+name+"-v.txt", gl.VERTEX_SHADER)
	}

	fragment := makeShader(res+name+"-f.txt", gl.FRAGMENT_SHADER)
	program := gl.CreateProgram()

	gl.AttachShader(program, vertex)
	gl.AttachShader(program, fragment)
	gl.LinkProgram(program)

	var status int32
	gl.GetProgramiv(program, gl.LINK_STATUS, &status)
	if status == gl.FALSE {
		var logLength int32
		gl.GetProgramiv(program, gl.INFO_LOG_LENGTH, &logLength)
		log := strings.Repeat("\x00", int(logLength+1))
		gl.GetProgramInfoLog(program, logLength, nil, gl.Str(log))
		fmt.Println("program error " + log)
		os.Exit(1)
	}

	gl.DeleteShader(vertex)
	gl.DeleteShader(fragment)

	gl.UseProgram(program)
	gl.Uniform1i(gl.GetUniformLocation(program, gl.Str("u_texture0\x00")), 0)
	gl.Uniform1i(gl.GetUniformLocation(program, gl.Str("u_texture1\x00")), 1)
	gl.Uniform1i(gl.GetUniformLocation(program, gl.Str("u_texture2\x00")), 2)
	gl.Uniform1i(gl.GetUniformLocation(program, gl.Str("u_texture3\x00")), 3)
	gl.UseProgram(0)

	err := gl.GetError()
	if err != gl.NO_ERROR {
		fmt.Printf("make program gl error 0x%x\n", err)
	}

	return program
}

func TextureData(name string) *image.RGBA {
	file, err := os.Open(res + name)
	if err != nil {
		fmt.Println("texture", file, "not found", err)
		os.Exit(1)
	}

	img, _, err := image.Decode(file)
	if err != nil {
		fmt.Println("texture", file, "decode error", err)
		os.Exit(1)
	}

	rgba := image.NewRGBA(img.Bounds())
	if rgba.Stride != rgba.Rect.Size().X*4 {
		fmt.Println("texture", file, "unsupported stride")
		os.Exit(1)
	}

	draw.Draw(rgba, rgba.Bounds(), img, image.Point{0, 0}, draw.Src)
	return rgba
}

func MakeTexture(name string, clamp, linear bool) uint32 {

	rgba := TextureData(name)
	var texture uint32

	gl.GenTextures(1, &texture)
	gl.ActiveTexture(gl.TEXTURE0)
	gl.BindTexture(gl.TEXTURE_2D, texture)

	if clamp {
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	} else {
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
	}

	if linear {
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	} else {
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	}

	gl.TexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, int32(rgba.Rect.Size().X), int32(rgba.Rect.Size().Y), 0, gl.RGBA, gl.UNSIGNED_BYTE, gl.Ptr(rgba.Pix))

	err := gl.GetError()
	if err != gl.NO_ERROR {
		fmt.Printf("make texture gl error 0x%x\n", err)
	}

	return texture
}

func MakeTextureArray(names []string, width, height int32, clamp, linear bool) uint32 {
	var texture uint32
	size := int32(len(names))

	gl.GenTextures(1, &texture)
	gl.ActiveTexture(gl.TEXTURE0)
	gl.BindTexture(gl.TEXTURE_2D_ARRAY, texture)
	gl.TexStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, width, height, size)

	for i := int32(0); i < size; i++ {
		rgba := TextureData(names[i])
		gl.TexSubImage3D(
			gl.TEXTURE_2D_ARRAY,
			0,
			0, 0, i,
			width, height, 1,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			gl.Ptr(rgba.Pix))
	}

	if clamp {
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	} else {
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT)
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT)
	}

	if linear {
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	} else {
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.TexParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	}

	err := gl.GetError()
	if err != gl.NO_ERROR {
		fmt.Printf("make texture array gl error 0x%x\n", err)
	}

	return texture
}
