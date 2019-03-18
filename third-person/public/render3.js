class Render3 {
    static Sprite(buffer, x, y, z, sin, cos, sprite) {
        let sine = sprite.half_width * sin;
        let cosine = sprite.half_width * cos;

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        Render.Index4(buffer)
    }
    static MirrorSprite(buffer, x, y, z, sin, cos, sprite) {
        let sine = sprite.half_width * sin;
        let cosine = sprite.half_width * cos;

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z - sine
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        Render.Index4(buffer)
    }
    static Sprite3(buffer, x, y, z, mv, sprite) {
        let right0 = mv[0]
        let right1 = mv[4]
        let right2 = mv[8]

        let up0 = mv[1]
        let up1 = mv[5]
        let up2 = mv[9]

        let rpu_x = right0 * sprite.width + up0 * sprite.height
        let rpu_y = right1 * sprite.width + up1 * sprite.height
        let rpu_z = right2 * sprite.width + up2 * sprite.height

        let rmu_x = right0 * sprite.width - up0 * sprite.height
        let rmu_y = right1 * sprite.width - up1 * sprite.height
        let rmu_z = right2 * sprite.width - up2 * sprite.height

        buffer.vertices[buffer.vertex_pos++] = x - rmu_x
        buffer.vertices[buffer.vertex_pos++] = y - rmu_y
        buffer.vertices[buffer.vertex_pos++] = z - rmu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        buffer.vertices[buffer.vertex_pos++] = x - rpu_x
        buffer.vertices[buffer.vertex_pos++] = y - rpu_y
        buffer.vertices[buffer.vertex_pos++] = z - rpu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.left
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + rmu_x
        buffer.vertices[buffer.vertex_pos++] = y + rmu_y
        buffer.vertices[buffer.vertex_pos++] = z + rmu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.bottom

        buffer.vertices[buffer.vertex_pos++] = x + rpu_x
        buffer.vertices[buffer.vertex_pos++] = y + rpu_y
        buffer.vertices[buffer.vertex_pos++] = z + rpu_z
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

        Render.Index4(buffer)
    }
}
