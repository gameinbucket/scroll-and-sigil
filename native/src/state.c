#include "state.h"

state *state_init(world *w, renderstate *rs) {
    state *s = safe_malloc(sizeof(state));
    s->w = w;
    s->rs = rs;
    return s;
}

void state_update(state *self) {
    world_update(self->w);
}

void state_render(state *self) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    renderstate *rs = self->rs;

    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);

    renderstate_set_program(rs, 0);

    graphics_set_orthographic(rs->canvas_orthographic, 0, 0, rs->modelviewprojection, rs->modelview);
    graphics_set_mvp(rs->program_id, rs->modelviewprojection);

    texture *t = rs->textures[0];
    glBindTexture(GL_TEXTURE_2D, t->id);

    renderbuffer *colors = rs->draw_colors;

    renderbuffer_zero(colors);
    render_rectangle(colors, 0, 0, 64, 64, 1.0, 0.5, 0);

    graphics_update_and_draw(colors);

    // glRotatef(0.4f, 0.0f, 1.0f, 0.0f);
    // glRotatef(0.2f, 1.0f, 1.0f, 1.0f);
    // glColor3f(0.0f, 1.0f, 0.0f);

    // glBegin(GL_QUADS);
    // glVertex2f(-0.5f, -0.5f);
    // glVertex2f(0.5f, -0.5f);
    // glVertex2f(0.5f, 0.5f);
    // glVertex2f(-0.5f, 0.5f);
    // glEnd();
}
