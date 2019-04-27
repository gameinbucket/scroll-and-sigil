package main

import (
	"syscall/js"
)

// Webgl
var (
	GLxStaticDraw         js.Value
	GLxArrayBuffer        js.Value
	GLxElementArrayBuffer js.Value
	GLxVertexShader       js.Value
	GLxFragmentShader     js.Value
	GLxFloat              js.Value
	GLxDepthTest          js.Value
	GLxColorBufferBit     js.Value
	GLxTriangles          js.Value
	GLxUnsignedShort      js.Value
	GLxLEqual             js.Value
	GLxBack               js.Value
	GLxSrcAlpha           js.Value
	GLxOneMinusSrcAlpha   js.Value
	GLxCullFace           js.Value
	GLxBlend              js.Value
)

// SetupOpenGl func
func SetupOpenGl(gl js.Value) {
	GLxStaticDraw = gl.Get("STATIC_DRAW")
	GLxArrayBuffer = gl.Get("ARRAY_BUFFER")
	GLxElementArrayBuffer = gl.Get("ELEMENT_ARRAY_BUFFER")
	GLxVertexShader = gl.Get("VERTEX_SHADER")
	GLxFragmentShader = gl.Get("FRAGMENT_SHADER")
	GLxFloat = gl.Get("FLOAT")
	GLxDepthTest = gl.Get("DEPTH_TEST")
	GLxColorBufferBit = gl.Get("COLOR_BUFFER_BIT")
	GLxTriangles = gl.Get("TRIANGLES")
	GLxUnsignedShort = gl.Get("UNSIGNED_SHORT")
	GLxLEqual = gl.Get("LEQUAL")
	GLxBack = gl.Get("BACK")
	GLxSrcAlpha = gl.Get("SRC_ALPHA")
	GLxOneMinusSrcAlpha = gl.Get("ONE_MINUS_SRC_ALPHA")
	GLxCullFace = gl.Get("CULL_FACE")
	GLxBlend = gl.Get("BLEND")
}
