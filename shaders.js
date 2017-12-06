function shader()
{
    this.use;
    this.off = [];
    this.img = [];
    
    this.attribute = [3, 4, 2];
    this.offset = [0, 3 * 4, (3 + 4) * 4];
    this.stride = (3 + 4 + 2) * 4;
}

shader.prototype.add = function(gl, n, v, f)
{
    this.off[n] = this.program(gl, v, f);
};

shader.prototype.set = function(gl, n)
{
    this.use = this.off[n];
    
    gl.useProgram(this.use);
    this.enableAttributes(gl);
};

shader.prototype.image = function(gl, n, s, e)
{
    var t = gl.createTexture();
    
    t.image = new Image();
    t.image.src = s;
    
    this.img[n] = t;
    
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, e);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, e);
    gl.bindTexture(gl.TEXTURE_2D, null);
};

shader.prototype.enableAttributes = function(gl)
{
    var p = this.getAttribute(gl, 'a_position');
    var c = this.getAttribute(gl, 'a_color');
    var t = this.getAttribute(gl, 'a_texture');
    
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, this.attribute[0], gl.FLOAT, false, this.stride, this.offset[0]);
    
    if (c > 0)
    {
        gl.enableVertexAttribArray(c);
        gl.vertexAttribPointer(c, this.attribute[1], gl.FLOAT, false, this.stride, this.offset[1]);
    }
    
    if (t > 0)
    {
        gl.enableVertexAttribArray(t);
        gl.vertexAttribPointer(t, this.attribute[2], gl.FLOAT, false, this.stride, this.offset[2]);
    }
};

shader.prototype.getAttribute = function(gl, a)
{
    return gl.getAttribLocation(this.use, a);
};

shader.prototype.getUniform = function(gl, u)
{
    return gl.getUniformLocation(this.use, u);
};

shader.prototype.texture0 = function(gl, n)
{
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.img[n]);
    gl.uniform1i(this.getUniform(gl, 'u_texture0'), 0);
};

shader.prototype.program = function(gl, v, f)
{
    var vert = this.generate(gl, xhr(v), gl.VERTEX_SHADER);
    var frag = this.generate(gl, xhr(f), gl.FRAGMENT_SHADER);
    var prog = gl.createProgram();
    
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    
    gl.linkProgram(prog);
    
    return prog;
};

shader.prototype.generate = function(gl, s, t)
{
    var shader = gl.createShader(t);
    
    gl.shaderSource(shader, s);
    gl.compileShader(shader);
    
    return shader;
};