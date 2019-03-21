class MenuState {
    constructor(app) {
        this.app = app
        this.sticky_up = true
        this.sticky_down = true
        this.sticky_enter = true
    }
    update() {
        if (Input.Is("ArrowUp")) {
            if (this.sticky_up) {
                this.sticky_up = false
            }
        } else this.sticky_up = true

        if (Input.Is("ArrowDown")) {
            if (this.sticky_down) {
                this.sticky_down = false
            }
        } else this.sticky_down = true

        if (Input.Is("Enter")) {
            if (this.sticky_enter) {
                this.sticky_enter = false
                app.switch(new WorldState(this.app))
            }
        } else this.sticky_enter = true
    }
    render() {
        let g = this.app.g
        let gl = this.app.gl
        let frame = this.app.frame
        let canvas = this.app.canvas
        let generic = this.app.generic
        let canvas_ortho = this.app.canvas_ortho
        let draw_ortho = this.app.draw_ortho
        let screen = this.app.screen

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        g.set_program(gl, "texture")
        g.set_orthographic(draw_ortho, 0, 0)
        g.update_mvp(gl)

        generic.zero()

        let size = 3
        let print = "scroll and sigil"
        let x = Math.floor((frame.width - print.length * FONT_WIDTH * size) * 0.5)
        let y = Math.floor(frame.height * 0.8 - FONT_HEIGHT)
        Render.Print(generic, print, x, y, size)

        size = 2
        print = "enter"
        x = Math.floor((frame.width - print.length * FONT_WIDTH * size) * 0.5)
        y = Math.floor(frame.height * 0.6 - FONT_HEIGHT)
        Render.Print(generic, print, x, y, size)


        g.set_texture(gl, "font")
        RenderSystem.UpdateAndDraw(gl, generic)

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, canvas.width, canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, screen)
    }
}

class WorldState {
    constructor(app) {
        this.app = app
        app.music.play().then(() => {}).catch((_) => {})
    }
    update() {
        this.app.world.update()
    }
    render() {
        let g = this.app.g
        let gl = this.app.gl
        let frame = this.app.frame
        let canvas = this.app.canvas
        let player = this.app.player
        let generic = this.app.generic
        let generic2 = this.app.generic2
        let colored = this.app.colored
        let canvas_ortho = this.app.canvas_ortho
        let draw_ortho = this.app.draw_ortho
        let screen = this.app.screen
        let world = this.app.world

        let view_x = -Math.floor(player.x - frame.width * 0.5)
        let view_y = -Math.floor(player.y - frame.height * 0.5)

        RenderSystem.SetFrameBuffer(gl, frame.fbo)
        RenderSystem.SetView(gl, 0, 0, frame.width, frame.height)

        gl.clearColor(world.red, world.green, world.blue, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        g.set_program(gl, "texture3")
        g.set_orthographic(draw_ortho, view_x, view_y)
        g.update_mvp(gl)

        const fps = false
        if (fps) {
            let before = performance.now()
            world.render(g, frame, player.x, player.y, generic)
            console.log(performance.now() - before)
        } else
            world.render(g, frame, player.x, player.y, generic)

        g.set_program(gl, "texture")
        g.set_orthographic(draw_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture(gl, "interface")
        generic.zero()

        let x = frame.width - 2 - 21 * 4
        let y = 2

        Render.Sprite(generic, x, y, SPRITE_DATA["interface"]["panel"])
        Render.Sprite(generic, x + 21, y, SPRITE_DATA["interface"]["panel"])
        Render.Sprite(generic, x + 21 * 2, y, SPRITE_DATA["interface"]["panel"])
        Render.Sprite(generic, x + 21 * 3, y, SPRITE_DATA["interface"]["panel"])

        // let health_bar = player.health
        // let health_gone = (player.health_lim - player.health)

        let stamina_bar = player.stamina
        let stamina_gone = (player.stamina_lim - player.stamina)

        let experience_bar = player.experience / player.experience_lim * 50.0
        let experience_remaining = (player.experience_lim - player.experience) / player.experience_lim * 50.0

        x = Math.floor(frame.width * 0.5 - 50 * 0.5)
        y = 2

        Render.ImageSprite(generic, x + experience_bar, y, SPRITE_DATA["interface"]["gone"], experience_remaining, 6)
        Render.ImageSprite(generic, x, y, SPRITE_DATA["interface"]["experience"], experience_bar, 6)

        y += 7
        Render.ImageSprite(generic, x + stamina_bar, y, SPRITE_DATA["interface"]["gone"], stamina_gone, 6)
        if (player.stamina_reduce > player.stamina) {
            let stamina_reduce = player.stamina_reduce - stamina_bar
            Render.ImageSprite(generic, x + stamina_bar, y, SPRITE_DATA["interface"]["reduce"], stamina_reduce, 6)
        }
        Render.ImageSprite(generic, x, y, SPRITE_DATA["interface"]["stamina"], stamina_bar, 6)

        // y += 7
        // Render.ImageSprite(generic, x + health_bar, y, SPRITE_DATA["interface"]["gone"][0], health_gone, 6)
        // if (player.health_reduce > player.health) {
        //     let health_reduce = player.health_reduce - health_bar
        //     Render.ImageSprite(generic, x + health_bar, y, SPRITE_DATA["interface"]["reduce"][0], health_reduce, 6)
        // }
        // Render.ImageSprite(generic, x, y, SPRITE_DATA["interface"]["health"][0], health_bar, 6)

        RenderSystem.UpdateAndDraw(gl, generic)

        g.set_texture(gl, "item")
        generic.zero()
        if (player.hand !== null) {
            let sprite = player.hand.sprite[0]
            Render.Sprite(generic, frame.width - 2 - 21 * 4 + 10 - sprite.width * 0.5, 2 + 10 - sprite.height * 0.5, sprite)
        }
        if (player.offhand !== null) {
            let sprite = player.offhand.sprite[0]
            Render.Sprite(generic, 62 + 10 - sprite.width * 0.5, 32 + 16 - sprite.height * 0.5, sprite)
        }
        if (player.item !== null) {
            let sprite = player.item.sprite[0]
            Render.Sprite(generic, 41 + 10 - sprite.width * 0.5, 16 + 16 - sprite.height * 0.5, sprite)
        }
        if (player.skill !== null) {
            let sprite = player.skill.sprite[0]
            Render.Sprite(generic, 41 + 10 - sprite.width * 0.5, 49 + 16 - sprite.height * 0.5, sprite)
        }
        RenderSystem.UpdateAndDraw(gl, generic)

        if (player.menu !== null)
            player.menu.render(g, gl, frame, generic, generic2)

        //
        colored.zero()
        let size = 1
        let print
        if (player.state === "death") print = "dead"
        else print = player.health.toString() + "%"
        x = Math.floor(frame.width * 0.5 - print.length * FONT_WIDTH * size * 0.5)
        y = 2 + 7 + 7
        Render.ColorPrint(colored, print, x, y, size, 0.0, 0.0, 0.0)
        Render.ColorPrint(colored, print, x - 1, y + 1, size, 1.0, 0.0, 0.0)
        // x += (print.length + 1) * FONT_WIDTH * size
        // print = Math.ceil(player.stamina / player.stamina_lim * 100).toString() + "%"
        // Render.ColorPrint(colored, print, x, y, size, 0.0, 0.0, 0.0)
        // Render.ColorPrint(colored, print, x - 1, y + 1, size, 0.0, 1.0, 0.0)
        g.set_program(gl, "color_texture")
        g.set_orthographic(draw_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture(gl, "font")
        RenderSystem.UpdateAndDraw(gl, colored)
        //

        RenderSystem.SetFrameBuffer(gl, null)
        RenderSystem.SetView(gl, 0, 0, canvas.width, canvas.height)
        g.set_program(gl, "texture")
        g.set_orthographic(canvas_ortho, 0, 0)
        g.update_mvp(gl)
        g.set_texture_direct(gl, frame.textures[0])
        RenderSystem.BindAndDraw(gl, screen)
    }
}
