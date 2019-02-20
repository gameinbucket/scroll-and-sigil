const SPRITE_SCALE = 0.01;
class Sprite
{
    constructor(left, top, width, height, sheet_width, sheet_height, ox, oy)
    {
        this.width = width * SPRITE_SCALE;
        this.height = height * SPRITE_SCALE;

        this.left = left * sheet_width;
        this.top = top * sheet_height;
        this.right = (left + width) * sheet_width;
        this.bottom = (top + height) * sheet_height;

        this.ox = ox * SPRITE_SCALE;
        this.oy = oy * SPRITE_SCALE;
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