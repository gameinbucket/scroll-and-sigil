const FONT = "0123456789abcdefghijklmnopqrstuvwxyz%"
const FONT_WIDTH = 9
const FONT_HEIGHT = 9
const FONT_GRID = Math.floor(64.0 / FONT_WIDTH)
const FONT_COLUMN = FONT_WIDTH / 64.0
const FONT_ROW = FONT_HEIGHT / 64.0
class Render {
    static Lumin(rgb) {
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
    }
    static PackRgb(red, green, blue) {
        return (red << 16) | (green << 8) | blue
    }
    static UnpackRgb(rgb) {
        let red = (rgb >> 16) & 255
        let green = (rgb >> 8) & 255
        let blue = rgb & 255
        return [red, green, blue]
    }
    static Index4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3
        buffer.indices[buffer.index_pos++] = buffer.index_offset
        buffer.index_offset += 4
    }
    static MirrorIndex4(buffer) {
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 2
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 3
        buffer.indices[buffer.index_pos++] = buffer.index_offset
        buffer.indices[buffer.index_pos++] = buffer.index_offset + 1
        buffer.index_offset += 4
    }
    static Color(buffer, x, y, width, height, red, green, blue) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue

        Render.Index4(buffer)
    }
    static Image(buffer, x, y, width, height, left, top, right, bottom) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = left
        buffer.vertices[buffer.vertex_pos++] = bottom

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = right
        buffer.vertices[buffer.vertex_pos++] = bottom

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = right
        buffer.vertices[buffer.vertex_pos++] = top

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = left
        buffer.vertices[buffer.vertex_pos++] = top

        Render.Index4(buffer)
    }
    static ColorImage(buffer, x, y, width, height, left, top, right, bottom, red, green, blue) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue
        buffer.vertices[buffer.vertex_pos++] = left
        buffer.vertices[buffer.vertex_pos++] = bottom

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue
        buffer.vertices[buffer.vertex_pos++] = right
        buffer.vertices[buffer.vertex_pos++] = bottom

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue
        buffer.vertices[buffer.vertex_pos++] = right
        buffer.vertices[buffer.vertex_pos++] = top

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = red
        buffer.vertices[buffer.vertex_pos++] = green
        buffer.vertices[buffer.vertex_pos++] = blue
        buffer.vertices[buffer.vertex_pos++] = left
        buffer.vertices[buffer.vertex_pos++] = top

        Render.Index4(buffer)
    }
    static ImageSprite(buffer, x, y, sprite, width, height) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y + height
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        Render.Index4(buffer)
    }
    static Sprite(buffer, x, y, sprite) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        Render.Index4(buffer)
    }
    static MirrorSprite(buffer, x, y, sprite) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        Render.Index4(buffer)
    }
    static Print(buffer, text, x, y, scale) {
        let xx = x
        let yy = y
        for (let i = 0; i < text.length; i++) {

            let c = text.charAt(i)

            if (c === " ") {
                xx += FONT_WIDTH * scale
                continue
            } else if (c === "\n") {
                xx = x
                yy += FONT_HEIGHT * scale
                continue
            }

            let loc = FONT.indexOf(c)

            let tx1 = Math.floor(loc % FONT_GRID) * FONT_COLUMN
            let ty1 = Math.floor(loc / FONT_GRID) * FONT_ROW
            let tx2 = tx1 + FONT_COLUMN
            let ty2 = ty1 + FONT_ROW

            Render.Image(buffer, xx, yy, FONT_WIDTH * scale, FONT_HEIGHT * scale, tx1, ty1, tx2, ty2)

            xx += FONT_WIDTH * scale
        }
    }
    static ColorPrint(buffer, text, x, y, scale, red, green, blue) {
        let xx = x
        let yy = y
        for (let i = 0; i < text.length; i++) {

            let c = text.charAt(i)

            if (c === " ") {
                xx += FONT_WIDTH * scale
                continue
            } else if (c === "\n") {
                xx = x
                yy += FONT_HEIGHT * scale
                continue
            }

            let loc = FONT.indexOf(c)

            let tx1 = Math.floor(loc % FONT_GRID) * FONT_COLUMN
            let ty1 = Math.floor(loc / FONT_GRID) * FONT_ROW
            let tx2 = tx1 + FONT_COLUMN
            let ty2 = ty1 + FONT_ROW

            Render.ColorImage(buffer, xx, yy, FONT_WIDTH * scale, FONT_HEIGHT * scale, tx1, ty1, tx2, ty2, red, green, blue)

            xx += FONT_WIDTH * scale
        }
    }
}