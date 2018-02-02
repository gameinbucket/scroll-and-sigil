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
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        Matrix.Perspective(g.perspective, 60, 0.01, 100.0, canvas.width / canvas.height);
        Matrix.Orthographic(g.orthographic, 0, canvas.width, 0, canvas.height, 0, 1);

        RenderSystem.MakeProgram(g, gl, 'color');
        RenderSystem.MakeProgram(g, gl, 'texture');

        let generics = new RenderBuffer(g, gl, 2, 3, 0, 1600, 2400);
        let generics2 = new RenderBuffer(g, gl, 2, 0, 2, 400, 600);

        RenderSystem.MakeImage(g, gl, 'stone', gl.CLAMP_TO_EDGE);

        let frame = new FrameBuffer(g, gl, canvas.width, canvas.height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], false, false);

        let screen = new RenderBuffer(g, gl, 2, 0, 2, 4, 6);
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0);
        RenderSystem.UpdateVao(gl, screen);

        window.onblur = App.ToggleOn(this, false);
        window.onfocus = App.ToggleOn(this, true);
        document.body.appendChild(canvas);

        this.on = true;
        this.canvas = canvas;
        this.gl = gl;
        this.g = g;
        this.draw = draw;
        this.io = io;
        this.frame = frame;
        this.generics = generics;
        this.generics2 = generics2;
        this.screen = screen;
    }
    static Run(app)
    {
        if (app.g.shaders['color'] === undefined || app.g.shaders['texture'] === undefined)
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

        RenderSystem.SetFrameBuffer(gl, frame.fbo);
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        RenderSystem.SetMvpOrthographic(g, 0, 0);

        RenderSystem.SetProgram(g, gl, 'color');
        RenderSystem.SetMvp(g, gl);
        RenderBuffer.Zero(app.generics);
        Render.Rectangle(app.generics, 10, 10, 64, 32, 0.5, 0.25, 0.75);
        Render.Circle(app.generics, 300, 200, 32, 0.25, 0.75, 0.50);
        Render.Skeleton(app.generics, 400, 300, 0.75, 0.50, 0.25);
        RenderSystem.DrawNew(gl, app.generics);

        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.SetMvp(g, gl);
        RenderBuffer.Zero(app.generics2);
        Render.Image(app.generics2, 128, 128, 64, 128, 0.0, 0.0, 1.0, 1.0);
        RenderSystem.SetTexture(g, gl, 'stone');
        RenderSystem.DrawNew(gl, app.generics2);

        RenderSystem.SetFrameBuffer(gl, null);
        RenderSystem.SetView(gl, 0, 0, app.canvas.width, app.canvas.height);
        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.SetMvpOrthographic(g, 0, 0);
        RenderSystem.SetMvp(g, gl);
        RenderSystem.SetTextureDirect(g, gl, frame.textures[0]);
        RenderSystem.Draw(gl, app.screen);
    }
}

App.Run(new App());