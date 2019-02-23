class Sprite {
    constructor(atlas, boxes, width, height, left, top, right, bottom, ox, oy) {
        this.atlas = atlas
        this.boxes = boxes
        this.width = width
        this.height = height
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
        this.ox = ox
        this.oy = oy
    }
    static Simple(left, top, width, height, sheet_size) {
        return [
            left * sheet_size,
            top * sheet_size,
            (left + width) * sheet_size,
            (top + height) * sheet_size
        ]
    }
    static Build(atlas, boxes, atlas_width, atlas_height) {
        let width = atlas[2]
        let height = atlas[3]
        let left = atlas[0] * atlas_width
        let top = atlas[1] * atlas_height
        let right = (atlas[0] + width) * atlas_width
        let bottom = (atlas[1] + height) * atlas_height
        let ox = 0
        let oy = 0

        if (atlas.length > 4) {
            ox = atlas[4]
            oy = atlas[5]
        }

        return new Sprite(atlas, boxes, width, height, left, top, right, bottom, ox, oy)
    }
    static Copy(sprite, ox, oy) {
        return new Sprite(sprite.atlas, sprite.boxes, sprite.width, sprite.height, sprite.left, sprite.top, sprite.right, sprite.bottom, ox, oy)
    }
}