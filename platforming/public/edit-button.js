class Button {
    constructor(app, sprite_texture, sprite, activate, deactivate = null, on = null, drag = null) {
        this.app = app
        this.active = false

        this.sprite_texture = sprite_texture
        this.sprite = sprite

        let button_sprite = SPRITES["buttons"]["active"][0]
        this.width = button_sprite.width
        this.height = button_sprite.height

        this.activate = activate
        this.deactivate = deactivate
        this.on = on
        this.drag = drag

        this.x = 0
        this.y = 0
    }
    put(x, y) {
        this.x = x
        this.y = y
    }
    click(x, y) {
        return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
    }
    draw(generic, sprite_buffer) {
        let sprite
        if (this.active) sprite = SPRITES["buttons"]["active"][0]
        else sprite = SPRITES["buttons"]["regular"][0]
        Render.Image(generic, this.x, this.y, this.width, this.height, sprite.left, sprite.top, sprite.right, sprite.bottom)

        sprite = SPRITES[this.sprite_texture][this.sprite][0]
        let w
        let h
        let ratio = sprite.width / sprite.height
        if (sprite.width > 20 || sprite.height > 20) {
            w = 20 * ratio
            h = 20
        } else {
            w = sprite.width
            h = sprite.height
        }
        let x = this.x - Math.floor((w - this.width) * 0.5)
        let y = this.y - Math.floor((h - this.height) * 0.5)
        Render.Image(sprite_buffer[this.sprite_texture], x, y, w, h, sprite.left, sprite.top, sprite.right, sprite.bottom)
    }
}