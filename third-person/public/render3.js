class Render3 {
    static Sprite(buffer, x, y, z, mv, sprite) {

        let right = [mv[0], mv[4], mv[8]]
        let up = [mv[1], mv[5], mv[9]]

        // let look = [mv[2], mv[6], mv[10]]
        // let xx = (1.0 - look_x)
        // let yy = (1.0 - look_y)
        // let zz = -look_z

        let rpu_x = right[0] * sprite.width + up[0] * sprite.height
        let rpu_y = right[1] * sprite.width + up[1] * sprite.height
        let rpu_z = right[2] * sprite.width + up[2] * sprite.height

        let rmu_x = right[0] * sprite.width - up[0] * sprite.height
        let rmu_y = right[1] * sprite.width - up[1] * sprite.height
        let rmu_z = right[2] * sprite.width - up[2] * sprite.height

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
    static MirrorSprite(buffer, x, y, z, look_x, look_y, look_z, sprite) {
        let sine = sprite.width * look_x
        let cosine = sprite.width * look_z

        buffer.vertices[buffer.vertex_pos++] = x - cosine
        buffer.vertices[buffer.vertex_pos++] = y + sprite.height
        buffer.vertices[buffer.vertex_pos++] = z + sine
        buffer.vertices[buffer.vertex_pos++] = sprite.right
        buffer.vertices[buffer.vertex_pos++] = sprite.top

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

        Render.Index4(buffer)
    }
}
