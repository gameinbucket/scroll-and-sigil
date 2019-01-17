class Sprite {
    constructor(atlas, boxes, width, height) {
        this.atlas = atlas
        this.boxes = boxes

        this.width = atlas[2]
        this.height = atlas[3]

        this.left = atlas[0] * width
        this.top = atlas[1] * height
        this.right = (atlas[0] + this.width) * width
        this.bottom = (atlas[1] + this.height) * height

        if (atlas.length > 4) {
            this.ox = atlas[4]
            this.oy = atlas[5]
        } else {
            this.ox = 0
            this.oy = 0
        }
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