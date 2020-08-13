use crate::graphics::render_buffer::RenderBuffer;
use crate::map::wall::Wall;

pub fn render_wall(b: &mut RenderBuffer, wall: &Wall) {
    let pos = b.vertex_position;
    let mut vertices = &mut b.vertices;

    vertices[pos] = w.va.x;
    vertices[pos + 1] = w.ceiling;
    vertices[pos + 2] = w.va.y;
    vertices[pos + 3] = w.u;
    vertices[pos + 4] = w.t;
    vertices[pos + 5] = w.ld.normal.x;
    vertices[pos + 6] = 0;
    vertices[pos + 7] = w.ld.normal.y;

    vertices[pos + 8] = w.va.x;
    vertices[pos + 9] = w.floor;
    vertices[pos + 10] = w.va.y;
    vertices[pos + 11] = w.u;
    vertices[pos + 12] = w.v;
    vertices[pos + 13] = w.ld.normal.x;
    vertices[pos + 14] = 0;
    vertices[pos + 15] = w.ld.normal.y;

    vertices[pos + 16] = w.vb.x;
    vertices[pos + 17] = w.floor;
    vertices[pos + 18] = w.vb.y;
    vertices[pos + 19] = w.s;
    vertices[pos + 20] = w.v;
    vertices[pos + 21] = w.ld.normal.x;
    vertices[pos + 22] = 0;
    vertices[pos + 23] = w.ld.normal.y;

    vertices[pos + 24] = w.vb.x;
    vertices[pos + 25] = w.ceiling;
    vertices[pos + 26] = w.vb.y;
    vertices[pos + 27] = w.s;
    vertices[pos + 28] = w.t;
    vertices[pos + 29] = w.ld.normal.x;
    vertices[pos + 30] = 0;
    vertices[pos + 31] = w.ld.normal.y;

    b.vertex_position = pos + 32;
    // render_index4(b);
}
