class Render3 {
    static Sprite(buffer, x, y, z, sprite) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        Render.Index4(buffer)
    }
    static MirrorSprite(buffer, x, y, z, sprite) {
        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x + sprite.width
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        Render.Index4(buffer)
    }
}