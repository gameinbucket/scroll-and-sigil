package main

import (
	"syscall/js"
)

func main() {
	done := make(chan struct{})
	console := js.Global().Get("console")

	console.Call("log", "begin main")

	doc := js.Global().Get("document")
	window := js.Global().Get("window")
	body := doc.Get("body")

	width := window.Get("innerWidth").Int()
	height := window.Get("innerHeight").Int()

	canvas := doc.Call("createElement", "canvas")
	canvasStyle := canvas.Get("style")

	canvasStyle.Set("display", "block")
	canvasStyle.Set("position", "absolute")
	canvasStyle.Set("left", "0")
	canvasStyle.Set("right", "0")
	canvasStyle.Set("top", "0")
	canvasStyle.Set("bottom", "0")
	canvasStyle.Set("margin", "auto")

	canvas.Set("width", width)
	canvas.Set("height", height)

	body.Call("appendChild", canvas)

	gl := canvas.Call("getContext", "webgl2")
	if gl == js.Undefined() {
		js.Global().Call("alert", "webgl is not supported")
		return
	}

	SetupOpenGl(gl)

	gl.Call("clearColor", 0, 0, 0, 1)
	gl.Call("depthFunc", GLxLEqual)
	gl.Call("cullFace", GLxBack)
	gl.Call("blendFunc", GLxSrcAlpha, GLxOneMinusSrcAlpha)
	gl.Call("disable", GLxCullFace)
	gl.Call("disable", GLxBlend)
	gl.Call("disable", GLxDepthTest)

	call := js.FuncOf(func(self js.Value, args []js.Value) interface{} {
		console.Call("log", "key up!")
		return nil
	})
	doc.Set("onkeyup", call)

	gl.Call("clear", GLxColorBufferBit)

	// glTypes.New()

	// //// VERTEX BUFFER ////
	// var verticesNative = []float32{
	// 	-0.5, 0.5, 0,
	// 	-0.5, -0.5, 0,
	// 	0.5, -0.5, 0,
	// }
	// var vertices = js.TypedArrayOf(verticesNative)
	// // Create buffer
	// vertexBuffer := gl.Call("createBuffer", glTypes.arrayBuffer)
	// // Bind to buffer
	// gl.Call("bindBuffer", glTypes.arrayBuffer, vertexBuffer)

	// // Pass data to buffer
	// gl.Call("bufferData", glTypes.arrayBuffer, vertices, glTypes.staticDraw)

	// // Unbind buffer
	// gl.Call("bindBuffer", glTypes.arrayBuffer, nil)

	// //// INDEX BUFFER ////
	// var indicesNative = []uint32{
	// 	2, 1, 0,
	// }
	// var indices = js.TypedArrayOf(indicesNative)

	// // Create buffer
	// indexBuffer := gl.Call("createBuffer", glTypes.elementArrayBuffer)

	// // Bind to buffer
	// gl.Call("bindBuffer", glTypes.elementArrayBuffer, indexBuffer)

	// // Pass data to buffer
	// gl.Call("bufferData", glTypes.elementArrayBuffer, indices, glTypes.staticDraw)

	// // Unbind buffer
	// gl.Call("bindBuffer", glTypes.elementArrayBuffer, nil)

	// //// Shaders ////

	// // Vertex shader source code
	// vertCode := `
	// attribute vec3 coordinates;

	// void main(void) {
	// 	gl_Position = vec4(coordinates, 1.0);
	// }`

	// // Create a vertex shader object
	// vertShader := gl.Call("createShader", glTypes.vertexShader)

	// // Attach vertex shader source code
	// gl.Call("shaderSource", vertShader, vertCode)

	// // Compile the vertex shader
	// gl.Call("compileShader", vertShader)

	// //fragment shader source code
	// fragCode := `
	// void main(void) {
	// 	gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
	// }`

	// // Create fragment shader object
	// fragShader := gl.Call("createShader", glTypes.fragmentShader)

	// // Attach fragment shader source code
	// gl.Call("shaderSource", fragShader, fragCode)

	// // Compile the fragmentt shader
	// gl.Call("compileShader", fragShader)

	// // Create a shader program object to store
	// // the combined shader program
	// shaderProgram := gl.Call("createProgram")

	// // Attach a vertex shader
	// gl.Call("attachShader", shaderProgram, vertShader)

	// // Attach a fragment shader
	// gl.Call("attachShader", shaderProgram, fragShader)

	// // Link both the programs
	// gl.Call("linkProgram", shaderProgram)

	// // Use the combined shader program object
	// gl.Call("useProgram", shaderProgram)

	// //// Associating shaders to buffer objects ////

	// // Bind vertex buffer object
	// gl.Call("bindBuffer", glTypes.arrayBuffer, vertexBuffer)

	// // Bind index buffer object
	// gl.Call("bindBuffer", glTypes.elementArrayBuffer, indexBuffer)

	// // Get the attribute location
	// coord := gl.Call("getAttribLocation", shaderProgram, "coordinates")

	// // Point an attribute to the currently bound VBO
	// gl.Call("vertexAttribPointer", coord, 3, glTypes.float, false, 0, 0)

	// // Enable the attribute
	// gl.Call("enableVertexAttribArray", coord)

	// //// Drawing the triangle ////

	// // Clear the canvas
	// gl.Call("clearColor", 0.5, 0.5, 0.5, 0.9)
	// gl.Call("clear", glTypes.colorBufferBit)

	// // Enable the depth test
	// gl.Call("enable", glTypes.depthTest)

	// // Set the view port
	// gl.Call("viewport", 0, 0, width, height)

	// // Draw the triangle
	// gl.Call("drawElements", glTypes.triangles, len(indicesNative), glTypes.unsignedShort, 0)

	console.Call("log", "end  main")
	<-done
}
