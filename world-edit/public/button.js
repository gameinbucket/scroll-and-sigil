class Button {
    constructor(app, sprite, func, x, y, w, h) {
        this.app = app;
        this.sprite = sprite;
        this.func = func;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    click(pos) {
        if (pos[0] >= this.x && pos[1] >= this.y && pos[0] <= this.x + this.w && pos[1] <= this.y + this.h) {
            this.func(this.app);
            return true;
        }
        return false;
    }
    draw(buffer) {
        let sprite = this.sprite;
        Render.Image(buffer, this.x, this.y, this.w, this.h, sprite.left, sprite.top, sprite.right, sprite.bottom);
    }
}