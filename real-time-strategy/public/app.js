const APP_EDIT_NOTHING = 0;
const APP_EDIT_ADD_BLOCK = 1;
const APP_EDIT_ADD_THING = 2;
class App {
    constructor() {

        let units = new Int32Array(10);

        units[0] = 0; // x
        units[1] = 0; // y
        units[2] = 0; // z
        units[3] = 0; // dx
        units[4] = 0; // dy
        units[5] = 0; // dz
        units[6] = 6; // radius

        let worker = new Worker("collision_worker.js");
        worker.onmessage = function (event) {
            let units = new Int32Array(event.data);
            console.log('main: ' + units.toString());
        };
        worker.postMessage(units.buffer, [units.buffer]);

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
        Matrix.Inverse(g.ip, g.perspective);

        RenderSystem.MakeProgram(g, gl, 'color');
        RenderSystem.MakeProgram(g, gl, 'texture');
        RenderSystem.MakeProgram(g, gl, 'texcol3d');
        RenderSystem.MakeProgram(g, gl, 'texture3d');

        let generics = RenderBuffer.Init(gl, 2, 3, 0, 1600, 2400);
        let generics2 = RenderBuffer.Init(gl, 2, 0, 2, 400, 600);

        let sprite_buffers = [
            RenderBuffer.Init(gl, 3, 0, 2, 400, 600)
        ];
        this.sprite_buffers = sprite_buffers;

        RenderSystem.MakeImage(g, gl, 'caverns', gl.CLAMP_TO_EDGE);
        RenderSystem.MakeImage(g, gl, 'footman', gl.CLAMP_TO_EDGE);

        let frame = new FrameBuffer(g, gl, canvas.width, canvas.height, [gl.RGB], [gl.RGB], [gl.UNSIGNED_BYTE], false, true);

        let screen = RenderBuffer.Init(gl, 2, 0, 2, 4, 6);
        Render.Image(screen, 0, 0, canvas.width, canvas.height, 0.0, 1.0, 1.0, 0.0);
        RenderSystem.UpdateVao(gl, screen);

        let s = 16.0;
        let w = 1.0 / 256.0;
        let h = 1.0 / 128.0;
        let sprite_cavern = {};
        sprite_cavern['dirt'] = new Sprite(1 + 17 * 0, 1 + 17 * 0, s, s, w, h, 0, 0)
        sprite_cavern['dirt light'] = new Sprite(1 + 17 * 0, 1 + 17 * 1, s, s, w, h, 0, 0)
        sprite_cavern['dirt lightest'] = new Sprite(1 + 17 * 0, 1 + 17 * 2, s, s, w, h, 0, 0)
        sprite_cavern['wall'] = new Sprite(1 + 17 * 1, 1 + 17 * 0, s, s, w, h, 0, 0)
        sprite_cavern['wall edge'] = new Sprite(1 + 17 * 1, 1 + 17 * 1, s, s, w, h, 0, 0)
        sprite_cavern['wall corner'] = new Sprite(1 + 17 * 1, 1 + 17 * 2, s, s, w, h, 0, 0)
        sprite_cavern['stone floor'] = new Sprite(1 + 17 * 1, 1 + 17 * 3, s, s, w, h, 0, 0)

        let world = new World(4, 4, 4);
        world.init();
        world.build(g, gl);

        w = 1.0 / 1024.0;
        h = 1.0 / 256.0;
        let d = 48.0;
        let z = 0.0;
        let t = 24.0;
        let footman_walk = [];
        footman_walk[0] = new Array(8);
        footman_walk[1] = new Array(8);
        footman_walk[2] = new Array(8);
        footman_walk[3] = new Array(8);
        footman_walk[4] = new Array(8);
        for (let i = 0; i < 5; i++) {
            footman_walk[i][0] = new Sprite(i * d, 0, d, d, w, h, z, t);
            footman_walk[i][1] = new Sprite(i * d, 4.0 * d, d, d, w, h, z, t);
            footman_walk[i][2] = new Sprite(i * d, 3.0 * d, d, d, w, h, z, t);
            footman_walk[i][3] = footman_walk[i][1];
            footman_walk[i][4] = footman_walk[i][0];
            footman_walk[i][5] = new Sprite(i * d, 0.0 * d, d, d, w, h, z, t);
            footman_walk[i][6] = new Sprite(i * d, 1.0 * d, d, d, w, h, z, t);
            footman_walk[i][7] = footman_walk[i][5];
        }

        new Unit().init(world, UNIT_COLOR_RED, 0, footman_walk, 16, 9, 20);

        window.onblur = App.ToggleOn(this, false);
        window.onfocus = App.ToggleOn(this, true);

        document.onkeyup = Input.KeyUp;
        document.onkeydown = Input.KeyDown;
        document.onmouseup = Input.MouseUp;
        document.onmousedown = Input.MouseDown;
        document.onmousemove = Input.MouseMove;

        let camera = new Camera(16.0, 16.0, 48.0, 0.0, 0.0);

        let func_nothing = function (app) {
            app.edit_state = APP_EDIT_NOTHING;
        };
        let button_nothing = new Button(this, sprite_cavern['dirt'], func_nothing, 10, 10, 32, 32);

        let func_add_block = function (app) {
            app.edit_state = APP_EDIT_ADD_BLOCK;
        };
        let button_add_block = new Button(this, sprite_cavern['wall'], func_add_block, 52, 10, 32, 32);

        let func_add_thing = function (app) {
            app.edit_state = APP_EDIT_ADD_THING;
        };
        let button_add_thing = new Button(this, sprite_cavern['stone floor'], func_add_thing, 94, 10, 32, 32);

        let buttons = [button_nothing, button_add_block, button_add_thing];

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
        this.buttons = buttons;
        this.edit_state = APP_EDIT_NOTHING;
        this.footman_walk = footman_walk;
        this.frame_count = 0;
        this.elapsed_time = 0;
        this.previous_time = new Date().getTime();
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
        return function () {
            app.on = on;
        }
    }
    static Loop() {
        if (APP.on) {
            APP.update();
            APP.render();
        }
        requestAnimationFrame(App.Loop);

        let now = new Date().getTime();
        APP.frame_count++;
        APP.elapsed_time += (now - APP.previous_time);
        APP.previous_time = now;
        if (APP.elapsed_time >= 1000) {
            let fps = APP.frame_count;
            APP.frame_count = 0;
            APP.elapsed_time -= 1000;
            console.log(fps);
        }
    }
    update() {
        if (Input.IsClick(0)) {
            Input.Clicked(0);
            INPUT_POS[1] = this.canvas.height - INPUT_POS[1];
            let open = true;
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].click(INPUT_POS)) {
                    open = false;
                    break;
                }
            }
            if (open) {
                switch (this.edit_state) {
                    case APP_EDIT_ADD_BLOCK:
                        {
                            let from_x = this.camera.x;
                            let from_y = this.camera.y;
                            let from_z = this.camera.z;
                            let to = Camera.Ray(this.canvas, INPUT_POS, this.g.ip, this.g.iv);
                            let to_x = this.camera.x + 999.0 * to[0];
                            let to_y = this.camera.y + 999.0 * to[1];
                            let to_z = this.camera.z + 999.0 * to[2];
                            let point = Cast.World(this.world, from_x, from_y, from_z, to_x, to_y, to_z);

                            let cx = Math.floor(point[0] / CHUNK_DIM);
                            let cy = Math.floor(point[1] / CHUNK_DIM);
                            let cz = Math.floor(point[2] / CHUNK_DIM);
                            let bx = Math.floor(point[0]) % CHUNK_DIM;
                            let by = Math.floor(point[1]) % CHUNK_DIM;
                            let bz = Math.floor(point[2]) % CHUNK_DIM;

                            let chunk = this.world.chunks[cx + cy * this.world.chunk_w + cz * this.world.chunk_slice];
                            let block = chunk.blocks[bx + by * CHUNK_DIM + bz * CHUNK_SLICE];

                            block.type = BLOCK_GRASS;

                            // todo: light process
                            // todo: occlusion calculate
                            chunk.build_mesh(this.world, this.g, this.gl);

                        }
                        break;
                    case APP_EDIT_ADD_THING:
                        {
                            let from_x = this.camera.x;
                            let from_y = this.camera.y;
                            let from_z = this.camera.z;
                            let to = Camera.Ray(this.canvas, INPUT_POS, this.g.ip, this.g.iv);
                            let to_x = this.camera.x + 10.0 * to[0];
                            let to_y = this.camera.y + 10.0 * to[1];
                            let to_z = this.camera.z + 10.0 * to[2];
                            let point = Cast.World(this.world, from_x, from_y, from_z, to_x, to_y, to_z);

                            let cx = Math.floor(point[0] / CHUNK_DIM);
                            let cy = Math.floor(point[1] / CHUNK_DIM);
                            let cz = Math.floor(point[2] / CHUNK_DIM);
                            let bx = Math.floor(point[0]) % CHUNK_DIM;
                            let by = Math.floor(point[1]) % CHUNK_DIM;
                            let bz = Math.floor(point[2]) % CHUNK_DIM;

                            let chunk = this.world.chunks[cx + cy * this.world.chunk_w + cz * this.world.chunk_slice];
                            let block = chunk.blocks[bx + by * CHUNK_DIM + bz * CHUNK_SLICE];

                            new Unit().init(this.world, UNIT_COLOR_RED, 0, this.footman_walk, point[0], point[1] + 2, point[2]);

                        }
                        break;
                }
            }
        }

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
        if (Input.Is(INPUT_LEFT)) {
            cam.ry -= 0.05;
        }
        if (Input.Is(INPUT_UP)) {
            cam.rx -= 0.05;
        }
        if (Input.Is(INPUT_DOWN)) {
            cam.rx += 0.05;
        }
        if (Input.Is(INPUT_RIGHT)) {
            cam.ry += 0.05;
        }

        this.world.update();
    }
    render() {
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
        Matrix.Inverse(g.iv, g.v);

        RenderSystem.SetProgram(g, gl, 'texcol3d');
        RenderSystem.UpdatedMvp(g, gl);
        RenderSystem.SetTexture(g, gl, 'caverns');

        let cam_chunk_x = Math.floor(cam.x / CHUNK_DIM);
        let cam_chunk_y = Math.floor(cam.y / CHUNK_DIM);
        let cam_chunk_z = Math.floor(cam.z / CHUNK_DIM);

        let sprite_buffers = this.sprite_buffers;

        for (let i = 0; i < sprite_buffers.length; i++) {
            sprite_buffers[i].zero();
        }

        // look_x, look_y, look_z -> g.mv[2], g.mv[6], g.mv[10]

        Occlusion.PrepareFrustum(g);
        Occlusion.Occlude(this.world, cam_chunk_x, cam_chunk_y, cam_chunk_z);
        this.world.render(gl, sprite_buffers, cam_chunk_x, cam_chunk_y, cam_chunk_z, g.mv);

        RenderSystem.SetProgram(g, gl, 'texture3d');
        RenderSystem.UpdatedMvp(g, gl);
        RenderSystem.SetTexture(g, gl, 'footman');
        for (let i = 0; i < sprite_buffers.length; i++) {
            RenderSystem.UpdateAndDraw(gl, sprite_buffers[i]);
        }

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        RenderSystem.SetMvpOrthographic(g, 0, 0);

        RenderSystem.SetProgram(g, gl, 'texture');
        RenderSystem.UpdatedMvp(g, gl);
        this.generics2.zero();
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw(this.generics2);
        }
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