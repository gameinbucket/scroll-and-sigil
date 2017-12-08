class RenderSystem
{
    constructor()
    {
        this.perspective = Matrix.Make();
        this.orthographic = Matrix.Make();
        this.model = Matrix.Make();
        this.mvp = Matrix.Make();
        
        this.v = new Array();
        this.i = new Array();
        
        this.vp;
        this.ip;
        this.io;
    }
    UsePerspective(x, y, z, pitch, yaw, roll)
    {
        Matrix.Identity(this.model);
        
        if (pitch !== 0) Matrix.RotateX(this.model, pitch);
        if (yaw   !== 0) Matrix.RotateY(this.model, yaw);
        if (roll  !== 0) Matrix.RotateZ(this.model, roll);
        
        Matrix.Translate(this.model, x, y, z);
        Matrix.Multiply(this.mvp, this.perspective, this.model);
    }
    UseOrthographic(x, y)
    {
        Matrix.Identity(this.model);
        Matrix.Translate(this.model, x, y, -1);
        Matrix.Multiply(this.mvp, this.orthographic, this.model);
    }
    Load(gl, s)
    {
        gl.uniformMatrix4fv(s.GetUniform(gl, 'u_mvp'), false, this.mvp);
    }
    Draw(gl)
    {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.v), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.i), gl.STATIC_DRAW);
        
        gl.drawElements(gl.TRIANGLES, this.ip, gl.UNSIGNED_SHORT, 0);
    }
    Start()
    {
        this.vp = 0;
        this.ip = 0;
        this.io = 0;
    }
    Quad(v)
    {
        for (var i = 0; i < v.length; i++)
        {
            this.v[this.vp++] = v[i];
        }
        this.i[this.ip++] = 0 + this.io;
        this.i[this.ip++] = 1 + this.io;
        this.i[this.ip++] = 2 + this.io;
        this.i[this.ip++] = 2 + this.io;
        this.i[this.ip++] = 3 + this.io;
        this.i[this.ip++] = 0 + this.io;
        this.io += 4;
    }
}