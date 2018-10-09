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
}