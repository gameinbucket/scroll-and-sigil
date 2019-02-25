const RESOURCES = 'resources/';
class RenderSystem
{
    constructor()
    {
        this.perspective = Matrix.Make();
        this.orthographic = Matrix.Make();
        this.v = Matrix.Make();
        this.mv = Matrix.Make();
        this.mvp = Matrix.Make();
        this.ip = Matrix.Make();
        this.iv = Matrix.Make();
        
        this.program;
        this.program_name;
        this.mvp_location = [];
        this.texture_location = [];
        this.shaders = [];
        this.textures = [];
    }
    static SetTexture(sys, gl, name)
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sys.textures[name]);
        gl.uniform1i(sys.texture_location[sys.program_name], 0);
    }
    static SetTextureDirect(sys, gl, texture)
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(sys.texture_location[sys.program_name], 0);
    }
    static SetProgram(sys, gl, name)
    {
        sys.program = sys.shaders[name];
        sys.program_name = name;
        gl.useProgram(sys.program);
    }
    static SetFrameBuffer(gl, fbo)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    }
    static SetView(gl, x, y, width, height)
    {
        gl.viewport(x, y, width, height);
        gl.scissor(x, y, width, height);
    }
    static BindVao(gl, buffer)
    {
        gl.bindVertexArray(buffer.vao);
    }
    static UpdateVao(gl, buffer)
    {
        gl.bindVertexArray(buffer.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.indices, gl.STATIC_DRAW);
    }
    static BindAndDraw(gl, buffer)
    {
        gl.bindVertexArray(buffer.vao);
        gl.drawElements(gl.TRIANGLES, buffer.index_pos, gl.UNSIGNED_INT, 0);
    }
    static DrawRange(gl, start, count)
    {
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, start);
    }
    static UpdateAndDraw(gl, buffer)
    {
        if (buffer.vertex_pos == 0)
        {
            return;
        }
        gl.bindVertexArray(buffer.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.indices, gl.DYNAMIC_DRAW);
        gl.drawElements(gl.TRIANGLES, buffer.index_pos, gl.UNSIGNED_INT, 0);
    }
    static SetMvpOrthographic(sys, x, y)
    {
        Matrix.Identity(sys.mv);
        Matrix.Translate(sys.mv, x, y, -1);
        Matrix.Multiply(sys.mvp, sys.orthographic, sys.mv);
    }
    static SetMvpPerspective(sys, x, y, z, rx, ry)
    {
        Matrix.Identity(sys.v);
        Matrix.RotateX(sys.v, rx);
        Matrix.RotateY(sys.v, ry);
        Matrix.TranslateFromView(sys.mv, sys.v, x, y, z);
        Matrix.Multiply(sys.mvp, sys.perspective, sys.mv);
    }
    static UpdatedMvp(sys, gl)
    {
        gl.uniformMatrix4fv(sys.mvp_location[sys.program_name], false, sys.mvp);
    }
    static MakeVao(gl, buffer, position, color, texture)
    {
        buffer.vao = gl.createVertexArray();
        buffer.vbo = gl.createBuffer();
        buffer.ebo = gl.createBuffer();
        gl.bindVertexArray(buffer.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ebo);

        let stride = (position + color + texture) * 4;
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
    }
    static UpdateFrameBuffer(sys, gl, frame)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame.fbo);
        for (let i = 0; i < frame.textures.length; i++)
        {
            gl.bindTexture(gl.TEXTURE_2D, frame.textures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, frame.internalFormat[i], frame.width, frame.height, 0, frame.format[i], frame.type[i], null);
        }
        if (frame.depth)
        {
            gl.bindTexture(gl.TEXTURE_2D, frame.depthTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH24_STENCIL8, frame.width, frame.height, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
        }
    }
    static MakeFrameBuffer(sys, gl, frame)
    {
        frame.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame.fbo);
        for (let i = 0; i < frame.textures.length; i++)
        {
            frame.textures[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, frame.textures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (frame.linear)
            {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else
            {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, frame.textures[i], 0);
            frame.drawBuffers[i] = gl.COLOR_ATTACHMENT0 + i;
        }
        gl.drawBuffers(frame.drawBuffers);
        if (frame.depth)
        {
            frame.depthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, frame.depthTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, frame.depthTexture, 0);
        }
        RenderSystem.UpdateFrameBuffer(sys, gl, frame);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        {
            console.error('framebuffer error');
        }
    }
    static MakeProgram(sys, gl, name)
    {
        var data = new Array(2);
        var completed = 0;

        sys.shaders[name] = null;

        function partial(id, text)
        {
            data[id] = text;
            completed++;
            if (completed === 2)
            {
                let program = RenderSystem.CompileProgram(gl, data[0], data[1]);
                sys.shaders[name] = program;
                sys.mvp_location[name] = gl.getUniformLocation(program, 'u_mvp');
                sys.texture_location[name] = gl.getUniformLocation(program, 'u_texture0');
            }
        }
    
        Network.Get(RESOURCES + name + '.v', 0, partial);
        Network.Get(RESOURCES + name + '.f', 1, partial);
    }
    static MakeImage(sys, gl, name, wrap)
    {
        sys.textures[name] = null;
        
        let texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function()
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
            gl.bindTexture(gl.TEXTURE_2D, null);

            sys.textures[name] = texture;
        }
        texture.image.src = RESOURCES + name + '.png';
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