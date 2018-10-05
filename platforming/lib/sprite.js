class Sprite {
    constructor(left, top, width, height, sheet_width, sheet_height, ox, oy) {
        this.width = width
        this.height = height

        this.left = left * sheet_width
        this.top = top * sheet_height
        this.right = (left + width) * sheet_width
        this.bottom = (top + height) * sheet_height

        this.ox = ox
        this.oy = oy
    }
    static Build(left, top, width, height, sheet_size) {
        return [
            left * sheet_size,
            top * sheet_size,
            (left + width) * sheet_size,
            (top + height) * sheet_size
        ]
    }
}