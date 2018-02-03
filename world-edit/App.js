class App
{
    constructor()
    {
        let canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.right = '0';
        canvas.style.top = '0';
        canvas.style.bottom = '0';
        canvas.style.margin = 'auto';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let gl = canvas.getContext("webgl2");
        let g = new RenderSystem();
        let draw = new Render();
        let io = new Input();

        gl.clearColor(0, 0, 0, 1);
        gl.depthFunc(gl.LEQUAL);
        gl.cullFace(gl.BACK);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.BLEND);

        Matrix.Perspective(g.perspective, 60, 0.01, 100.0, canvas.width / canvas.height);
        Matrix.Orthographic(g.orthographic, 0, canvas.width, 0, canvas.height, 0, 1);

        RenderSystem.MakeProgram(g, gl, 'color');
        RenderSystem.MakeProgram(g, gl, 'texture');
        RenderSystem.MakeProgram(g, gl, 'texture-atlas');

        let generics = new RenderBuffer(g, gl, 2, 3, 0, 1600, 2400);
        let generics2 = new RenderBuffer(g, gl, 2, 0, 2, 400, 600);
        let mapBuffer = new RenderBuffer(g, gl, 3, 0, 3, 3200, 4800);

        RenderSystem.MakeImage(g, gl, 'stone', gl.CLAMP_TO_EDGE);
        RenderSystem.MakeImage(g, gl, 'atlas', gl.CLAMP_TO_EDGE);

        let frame = new FrameBuffer(g, gl, canvas.width, canvas.height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], false, false);

        let screen = new RenderBuffer(g, gl, 2, 0, 2, 4, 6);
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0);
        RenderSystem.UpdateVao(gl, screen);

        let map = new Map();
        Map.Init(map);
        Map.Mesh(map);

        this.on = true;
        this.canvas = canvas;
        this.gl = gl;
        this.g = g;
        this.draw = draw;
        this.io = io;
        this.frame = frame;
        this.generics = generics;
        this.generics2 = generics2;
        this.mapBuffer = mapBuffer;
        this.screen = screen;
        this.map = map;

        window.onblur = App.ToggleOn(this, false);
        window.onfocus = App.ToggleOn(this, true);
        document.body.appendChild(canvas);
    }
    static Run(app)
    {
        if (app.g.shaders['color'] === undefined || app.g.shaders['texture'] === undefined || app.g.shaders['texture-atlas'] === undefined)
        {
            setTimeout(App.Run, 1000, app);
        }
        else
        {
            App.Loop(app);
        }
    }
    static ToggleOn(app, on)
    {
        return function()
        {
            app.on = on;
        }
    }
    static Loop(app)
    {
        if (app.on)
        {
            App.Update(app);
            App.Render(app);
        }
        setTimeout(App.Loop, 1000 / 60, app);
    }
    static Update(app)
    {
        let input = app.io;

        if (Input.Is(input, 'q'))
        {
            Input.Off(input, 'q');
        }
    }
    static Render(app)
    {
        let g = app.g;
        let gl = app.gl;
        let frame = app.frame;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        
        RenderSystem.SetFrameBuffer(gl, frame.fbo);
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        RenderSystem.SetProgram(g, gl, 'texture-atlas');
        RenderSystem.SetMvpPerspective(g, 0, 0, 0, 0, 0);
        RenderSystem.SendMvp(g, gl);
        RenderSystem.SetTextureArray(g, gl, 'atlas');
        Map.Render(app.map, app.mapBuffer);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        
        /* gl.clear(gl.COLOR_BUFFER_BIT);
        RenderSystem.SetMvpOrthographic(g, 0, 0);

        RenderSystem.SetProgram(g, gl, 'color');
        RenderSystem.SendMvp(g, gl);
        RenderBuffer.Zero(app.generics);
        Render.Rectangle(app.generics, 10, 10, 64, 32, 0.5, 0.25, 0.75);
        Render.Circle(app.generics, 300, 200, 32, 0.25, 0.75, 0.50);
        RenderSystem.DrawNew(gl, app.generics);

        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.SendMvp(g, gl);
        RenderBuffer.Zero(app.generics2);
        Render.Image(app.generics2, 128, 128, 64, 128, 0.0, 0.0, 1.0, 1.0);
        RenderSystem.SetTexture(g, gl, 'stone');
        RenderSystem.DrawNew(gl, app.generics2);

        RenderSystem.SetFrameBuffer(gl, null);
        RenderSystem.SetView(gl, 0, 0, app.canvas.width, app.canvas.height);
        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.SetMvpOrthographic(g, 0, 0);
        RenderSystem.SendMvp(g, gl);
        RenderSystem.SetTextureDirect(g, gl, frame.textures[0]);
        RenderSystem.Draw(gl, app.screen); */
    }
}

App.Run(new App());