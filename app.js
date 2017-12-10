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

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.depthFunc(gl.LEQUAL);
        gl.cullFace(gl.BACK);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);

        Matrix.Perspective(g.perspective, 60, 0.01, 100.0, canvas.width / canvas.height);
        Matrix.Orthographic(g.orthographic, 0, canvas.width, 0, canvas.height, 0, 1);

        RenderSystem.MakeProgram(g, gl, 'color');
        RenderSystem.MakeProgram(g, gl, 'texture');

        let generics = new RenderBuffer(100 * 5, 100 * 6);
        RenderSystem.MakeVao(g, gl, generics, 2, 3, 0);

        let generics2 = new RenderBuffer(100 * 5, 100 * 6);
        RenderSystem.MakeVao(g, gl, generics2, 2, 0, 2);

        RenderSystem.MakeImage(g, gl, 'stone', gl.CLAMP_TO_EDGE);

        window.onblur = App.ToggleOn(this, false);
        window.onfocus = App.ToggleOn(this, true);
        document.body.appendChild(canvas);

        this.canvas = canvas;
        this.gl = gl;
        this.g = g;
        this.draw = draw;
        this.io = io;
        this.generics = generics;
        this.generics2 = generics2;
        this.on = true;
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

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        RenderSystem.SetFrameBuffer(gl, null);
        RenderSystem.SetView(gl, 0, 0, app.canvas.width, app.canvas.height);
        RenderSystem.SetMvpOrthographic(g, 0, 0);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        RenderSystem.SetProgram(g, gl, 'color');
        RenderSystem.SetMvp(g, gl);
        RenderBuffer.Zero(app.generics);
        Render.Rectangle(app.generics, 10, 10, 64, 32, 0.5, 0.25, 0.75);
        RenderSystem.DrawNew(gl, app.generics);

        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.SetMvp(g, gl);
        RenderBuffer.Zero(app.generics2);
        Render.Image(app.generics2, 128, 128, 64, 128, 0.0, 0.0, 1.0, 1.0);
        RenderSystem.SetTexture(g, gl, 'stone');
        RenderSystem.DrawNew(gl, app.generics2);
    }
}

App.Run(new App());