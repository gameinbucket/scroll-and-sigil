class Sprite
{
    constructor(left, top, width, height, sheet_width, sheet_height, offset_x, offset_y)
    {
        this.w = width
        this.h = height

        this.u = left * sheet_width
        this.v = top * sheet_height
        this.s = (left + width) * sheet_width
        this.t = (top + height) * sheet_height

        this.ox = offset_x
        this.oy = offset_y
    }
    static Build(left, top, width, height, sheet_width, sheet_height) {
        return [
            left * sheet_width,
            top * sheet_height,
            (left + width) * sheet_width,
            (top + height) * sheet_height
        ];
    }
}