class RenderSystem
{
    constructor()
    {
        this.perspective = Matrix.Make();
        this.orthographic = Matrix.Make();
        this.mv = Matrix.Make();
        this.mvp = Matrix.Make();
        
        this.program;
        this.programName;
        this.mvpLocation = [];
        this.textureLocation = [];
        this.shaders = [];
        this.textures = [];
    }
    static SetTexture(sys, gl, name)
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sys.textures[name]);
        gl.uniform1i(sys.textureLocation[sys.programName], 0);
    }
    static SetProgram(sys, gl, name)
    {
        sys.program = sys.shaders[name];
        sys.programName = name;
        gl.useProgram(sys.program);
    }
    static SetFrameBuffer(gl, id)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, id);
    }
    static SetView(gl, x, y, width, height)
    {
        gl.viewport(x, y, width, height);
        gl.scissor(x, y, width, height);
    }
    static Draw(gl, buffer)
    {
        if (buffer.vertexPos == 0)
        {
            return;
        }
        gl.bindVertexArray(buffer.vao);
        gl.drawElements(gl.TRIANGLES, buffer.indexPos, gl.UNSIGNED_SHORT, 0);
    }
    static DrawNew(gl, buffer)
    {
        if (buffer.vertexPos == 0)
        {
            return;
        }
        gl.bindVertexArray(buffer.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, buffer.indexPos, gl.UNSIGNED_SHORT, 0);
    }
    static SetMvpOrthographic(sys, x, y)
    {
        Matrix.Identity(sys.mv);
        Matrix.Translate(sys.mv, x, y, -1);
        Matrix.Multiply(sys.mvp, sys.orthographic, sys.mv);
    }
    static SetMvpPerspective(sys, x, y, z, rx, ry)
    {
        Matrix.Identity(sys.mv);
        
        if (rx !== 0) Matrix.RotateX(sys.mv, rx);
        if (ry !== 0) Matrix.RotateY(sys.mv, ry);

        Matrix.Translate(sys.mv, x, y, z);
        Matrix.Multiply(sys.mvp, sys.perspective, sys.mv);
    }
    static SetMvp(sys, gl)
    {
        gl.uniformMatrix4fv(sys.mvpLocation[sys.programName], false, sys.mvp);
    }
    static MakeVao(sys, gl, buffer, position, color, texture)
    {
        buffer.vao = gl.createVertexArray();
        gl.bindVertexArray(buffer.vao);
    
        buffer.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);

        buffer.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo);

        let stride = position + color + texture;
        buffer.stride = stride;
        stride *= 4;
        let index = 0;
        let offset = 0;
        if (position > 0)
        {
            gl.vertexAttribPointer(index, position, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(index);
            index++;
            offset += position * 4;
        }
        if (color > 0)
        {
            gl.vertexAttribPointer(index, color, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(index);
            index++;
            offset += color * 4;
        }
        if (texture > 0)
        {
            gl.vertexAttribPointer(index, texture, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(index);
        }
    
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    static MakeProgram(sys, gl, name)
    {
        var data = new Array(2);
        var completed = 0;

        function partial(id, text)
        {
            data[id] = text;
            completed++;
            if (completed === 2)
            {
                let program = RenderSystem.CompileProgram(gl, data[0], data[1]);
                sys.shaders[name] = program;
                sys.mvpLocation[name] = gl.getUniformLocation(program, 'u_mvp');
                sys.textureLocation[name] = gl.getUniformLocation(program, 'u_texture0');
            }
        }
    
        Network.Get(name + '.v', 0, partial);
        Network.Get(name + '.f', 1, partial);
    }
    static MakeImage(sys, gl, name, wrap)
    {
        let texture = gl.createTexture();
        
        texture.image = new Image();
        texture.image.src = name + '.png';
        
        sys.textures[name] = texture;
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    static CompileProgram(gl, v, f)
    {
        let vert = RenderSystem.CompileShader(gl, v, gl.VERTEX_SHADER);
        let frag = RenderSystem.CompileShader(gl, f, gl.FRAGMENT_SHADER);
        let program = gl.createProgram();
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            console.error(v + ', ' + f);
            console.error(gl.getProgramInfoLog(program));
        }
        return program;
    }
    static CompileShader(gl, source, type)
    {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            console.error(source);
            console.error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }
}