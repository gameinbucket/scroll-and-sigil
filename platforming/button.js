class Button {
    constructor(app, sprite, action, w, h) {
        this.app = app
        this.sprite = sprite
        this.action = action
        this.w = w
        this.h = h
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
    draw(buffer) {
        let sprite = this.sprite;
        Render.Image(buffer, this.x, this.y, this.w, this.h, sprite.left, sprite.top, sprite.right, sprite.bottom)
    }
}