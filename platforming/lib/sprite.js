class Sprite {
    constructor(left, top, width, height, inverse_sheet, ox = 0, oy = 0) {
        this.width = width
        this.height = height

        this.left = left * inverse_sheet
        this.top = top * inverse_sheet
        this.right = (left + width) * inverse_sheet
        this.bottom = (top + height) * inverse_sheet

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