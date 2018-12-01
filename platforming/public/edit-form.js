class EditForm {
    constructor(x, y, width, height) {
        this.x = x
        this.y = x
        this.width = width
        this.height = height
    }
    resize() {

    }
    click(x, y) {
        return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
    }
    draw(sprite_buffer) {

    }
}