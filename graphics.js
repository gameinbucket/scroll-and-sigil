function graphic()
{
    this.perspective = new Array(16);
    this.orthographic = new Array(16);
    this.model = new Array(16);
    this.mvp = new Array(16);
    
    this.v = new Array();
    this.i = new Array();
    
    this.vp;
    this.ip;
    this.io;
}

graphic.prototype.usePerspective = function(mat, x, y, z, pitch, yaw, roll)
{
    mat.identity(this.model);
    
    if (pitch !== 0) mat.rotate_x(this.model, pitch * 0.017453292519943);
    if (yaw   !== 0) mat.rotate_y(this.model, yaw   * 0.017453292519943);
    if (roll  !== 0) mat.rotate_z(this.model, roll  * 0.017453292519943);
    
    mat.translate(this.model, x, y, z);
    mat.multiply(this.mvp, this.perspective, this.model);
};

graphic.prototype.useOrthographic = function(mat, x, y)
{
    mat.identity(this.model);
    mat.translate(this.model, x, y, -1);
    mat.multiply(this.mvp, this.orthographic, this.model);
};

graphic.prototype.load = function(gl, s)
{
    gl.uniformMatrix4fv(s.getUniform(gl, 'u_mvp'), false, this.mvp);
};

graphic.prototype.draw = function(gl)
{
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.v), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.i), gl.STATIC_DRAW);
    
    gl.drawElements(gl.TRIANGLES, this.ip, gl.UNSIGNED_SHORT, 0);
};

graphic.prototype.start = function()
{
    this.vp = 0;
    this.ip = 0;
    this.io = 0;
};

graphic.prototype.quad = function(v)
{
    for (var i = 0; i < v.length; i++)
        this.v[this.vp++] = v[i];
    
    this.i[this.ip++] = 0 + this.io;
    this.i[this.ip++] = 1 + this.io;
    this.i[this.ip++] = 2 + this.io;
    this.i[this.ip++] = 2 + this.io;
    this.i[this.ip++] = 3 + this.io;
    this.i[this.ip++] = 0 + this.io;
    this.io += 4;
};