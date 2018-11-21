class Button {
    constructor(app, sprite_texture, sprite, action) {
        this.app = app
        this.action = action
        this.active = false

        this.sprite_texture = sprite_texture
        this.sprite = sprite

        let button_sprite = SPRITES["buttons"]["active"][0]
        this.w = button_sprite.width
        this.h = button_sprite.height

        this.x = 0
        this.y = 0
    }
    put(x, y) {
        this.x = x
        this.y = y
        return this
    }
    click(x, y) {
        return x >= this.x && y >= this.y && x <= this.x + this.w && y <= this.y + this.h
    }
    activate() {
        // TODO
    }
    deactivate() {
        // TODO
    }
    draw(generic, generic2) {
        let sprite
        if (this.active) sprite = SPRITES["buttons"]["active"][0]
        else sprite = SPRITES["buttons"]["regular"][0]
        Render.Image(generic, this.x, this.y, this.w, this.h, sprite.left, sprite.top, sprite.right, sprite.bottom)

        // sprite = SPRITES[this.sprite_texture][this.sprite][0]
        // Render.Image(generic2, this.x, this.y, this.w, this.h, sprite.left, sprite.top, sprite.right, sprite.bottom)
    }
}