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

        gl.clearColor(0, 0, 0, 1);
        gl.depthFunc(gl.LEQUAL);
        gl.cullFace(gl.BACK);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        Matrix.Perspective(g.perspective, 60.0, 0.01, 100.0, canvas.width / canvas.height);
        Matrix.Orthographic(g.orthographic, 0.0, canvas.width, 0.0, canvas.height, 0.0, 1.0);

        RenderSystem.MakeProgram(g, gl, 'color');
        RenderSystem.MakeProgram(g, gl, 'texture');
        RenderSystem.MakeProgram(g, gl, 'texture3d');

        let generics = RenderBuffer.Init(gl, 2, 3, 0, 1600, 2400);
        let generics2 = RenderBuffer.Init(gl, 2, 0, 2, 400, 600);

        RenderSystem.MakeImage(g, gl, 'caverns', gl.CLAMP_TO_EDGE);

        let frame = new FrameBuffer(g, gl, canvas.width, canvas.height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], false, true);

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6);
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0);
        RenderSystem.UpdateVao(gl, screen);

        let s = 16.0;
        let w = 1.0 / 256.0;
        let h = 1.0 / 128.0;
        let sprite_cavern = {};
        sprite_cavern['dirt'] = new Sprite(1+17*0, 1+17*0, s, s, w, h, 0, 0)
        sprite_cavern['dirt light'] = new Sprite(1+17*0, 1+17*1, s, s, w, h, 0, 0)
        sprite_cavern['dirt lightest'] = new Sprite(1+17*0, 1+17*2, s, s, w, h, 0, 0)
        sprite_cavern['wall'] = new Sprite(1+17*1, 1+17*0, s, s, w, h, 0, 0)
        sprite_cavern['wall edge'] = new Sprite(1+17*1, 1+17*1, s, s, w, h, 0, 0)
        sprite_cavern['wall corner'] = new Sprite(1+17*1, 1+17*2, s, s, w, h, 0, 0)
        sprite_cavern['stone floor'] = new Sprite(1+17*1, 1+17*3, s, s, w, h, 0, 0)

        let world = new World(2, 2, 2);
        world.init();
        world.mesh(g, gl);

        let you = new Unit();
        you.init(world, 0, 1, 1, 1);

        window.onblur = App.ToggleOn(this, false);
        window.onfocus = App.ToggleOn(this, true);
        
        document.onkeyup = Input.KeyUp;
        document.onkeydown = Input.KeyDown;
        document.onmouseup = Input.MouseUp;
        document.onmousedown = Input.MouseDown;

        let camera = new Camera(0.0, 0.0, 10.0, 0.0, 0.0);

        this.on = true;
        this.canvas = canvas;
        this.gl = gl;
        this.g = g;
        this.frame = frame;
        this.generics = generics;
        this.generics2 = generics2;
        this.screen = screen;
        this.world = world;
        this.camera = camera;
        this.sprite_cavern = sprite_cavern;
    }
    static Run(app) {
        for (let key in app.g.shaders) {
            if (app.g.shaders[key] === null) {
                setTimeout(App.Run, 500, app);
                return;
            }
        }
        for (let key in app.g.textures) {
            if (app.g.textures[key] === null) {
                setTimeout(App.Run, 500, app);
                return;
            }
        }
        let wait = document.getElementById('wait');
        wait.parentNode.removeChild(wait);
        document.body.appendChild(app.canvas);
        App.Loop(app);
    }
    static ToggleOn(app, on) {
        return function() {
            app.on = on;
        }
    }
    static Loop() {
        if (APP.on) {
            APP.update();
            APP.render();
        }
        requestAnimationFrame(App.Loop);
    }
    update() {
        let cam = this.camera;
        let pace = 0.1;
        if (Input.Is(INPUT_W)) {
            cam.x += Math.sin(cam.ry) * pace;
            cam.z -= Math.cos(cam.ry) * pace;
        }
        if (Input.Is(INPUT_S)) {
            cam.x -= Math.sin(cam.ry) * pace;
            cam.z += Math.cos(cam.ry) * pace;
        }
        if (Input.Is(INPUT_A)) {
            cam.x -= Math.cos(cam.ry) * pace;
            cam.z -= Math.sin(cam.ry) * pace;
        }
        if (Input.Is(INPUT_D)) {
            cam.x += Math.cos(cam.ry) * pace;
            cam.z += Math.sin(cam.ry) * pace;
        }
        if (Input.Is(INPUT_Q)) {
            cam.y += 0.1;
        }
        if (Input.Is(INPUT_E)) {
            cam.y -= 0.1;
        }
        if (Input.Is(INPUT_UP)) {
            cam.rx -= 0.05;
        }
        if (Input.Is(INPUT_DOWN)) {
            cam.rx += 0.05;
        }
        if (Input.Is(INPUT_LEFT)) {
            cam.ry -= 0.05;
        }
        if (Input.Is(INPUT_RIGHT)) {
            cam.ry += 0.05;
        }
    }
    render()
    {
        let g = this.g;
        let gl = this.gl;
        let frame = this.frame;
        let cam = this.camera;

        RenderSystem.SetFrameBuffer(gl, frame.fbo);
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        RenderSystem.SetMvpPerspective(g, -cam.x, -cam.y, -cam.z, cam.rx, cam.ry);
        
        RenderSystem.SetProgram(g, gl, 'texture3d');
        RenderSystem.UpdatedMvp(g, gl);
        RenderSystem.SetTexture(g, gl, 'caverns');

        let cam_chunk_x = Math.floor(cam.x / CHUNK_DIM);
        let cam_chunk_y = Math.floor(cam.y / CHUNK_DIM);
        let cam_chunk_z = Math.floor(cam.z / CHUNK_DIM);
        
        this.world.render(gl, cam_chunk_x, cam_chunk_y, cam_chunk_z);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        RenderSystem.SetMvpOrthographic(g, 0, 0);

        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.UpdatedMvp(g, gl);
        RenderBuffer.Zero(this.generics2);
        let sprite = this.sprite_cavern['wall'];
        Render.Image(this.generics2, 10, 10, 32, 32, sprite.u, sprite.v, sprite.s, sprite.t);
        RenderSystem.SetTexture(g, gl, 'caverns');
        RenderSystem.UpdateAndDraw(gl, this.generics2);

        RenderSystem.SetFrameBuffer(gl, null);
        RenderSystem.SetView(gl, 0, 0, this.canvas.width, this.canvas.height);
        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.SetMvpOrthographic(g, 0, 0);
        RenderSystem.UpdatedMvp(g, gl);
        RenderSystem.SetTextureDirect(g, gl, frame.textures[0]);
        RenderSystem.BindAndDraw(gl, this.screen);
    }
}

const APP = new App();
App.Run(APP);