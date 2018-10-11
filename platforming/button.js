class Button {
    constructor(app, sprite, action, x, y, w, h) {
        this.app = app
        this.sprite = sprite
        this.action = action
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
    click(x, y) {
        return x >= this.x && y >= this.y && x <= this.x + this.w && y <= this.y + this.h
    }
    draw(buffer) {
        let sprite = this.sprite;
        Render.Image(buffer, this.x, this.y, this.w, this.h, sprite.left, sprite.top, sprite.right, sprite.bottom)
    }
}