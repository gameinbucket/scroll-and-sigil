#include "renderstate.h"

renderstate *renderstate_init() {
    return safe_calloc(1, sizeof(renderstate));
}

void renderstate_resize(renderstate *self, int screen_width, int screen_height) {

    int draw_width = screen_width;
    int draw_height = screen_height;

    float fov = 60.0;
    float ratio = (float)draw_width / (float)draw_height;

    matrix_orthographic(self->canvas_orthographic, 0.0, screen_width, 0.0, screen_height, 0.0, 1.0);
    matrix_orthographic(self->draw_orthographic, 0.0, draw_width, 0.0, draw_height, 0.0, 1.0);

    matrix_perspective(self->draw_perspective, fov, 0.01, 100.0, ratio);
    matrix_inverse(self->draw_inverse_perspective, self->draw_perspective);

    if (self->frame == NULL) {

#ifdef RENDER_STATE_DEBUG
        printf("render state initial resize\n");
#endif

        int textures = 1;

        GLint *internal = safe_malloc(sizeof(GLint) * textures);
        GLint *format = safe_malloc(sizeof(GLint) * textures);
        GLint *texture_type = safe_malloc(sizeof(GLint) * textures);

        internal[0] = GL_RGB;
        format[0] = GL_RGB;
        texture_type[0] = GL_UNSIGNED_BYTE;

        framebuffer *frame = framebuffer_init(draw_width, draw_height, textures, internal, format, texture_type, GL_NEAREST, true);
        graphics_make_fbo(frame);

        self->frame = frame;

    } else {
        graphics_framebuffer_resize(self->frame, draw_width, draw_height);
    }

    renderbuffer_zero(self->screen);
    renderbuffer_zero(self->frame_screen);

    render_screen(self->screen, 0, 0, screen_width, screen_height);
    render_screen(self->frame_screen, 0, 0, draw_width, draw_height);

    graphics_update_vao(self->screen, GL_STATIC_DRAW);
    graphics_update_vao(self->frame_screen, GL_STATIC_DRAW);
}

void renderstate_set_mvp(renderstate *self, float *mvp) {
    glUniformMatrix4fv(self->active_shader->u_mvp, 1, GL_FALSE, mvp);

#ifdef RENDER_STATE_DEBUG
    printf("render state set model view projection := %d\n", self->active_shader->u_mvp);
#endif
}

void renderstate_set_program(renderstate *self, int shader_index) {
    shader *s = self->shaders[shader_index];
    self->active_shader = s;
    glUseProgram(s->id);

#ifdef RENDER_STATE_DEBUG
    printf("render state use program := %d\n", s->id);
#endif
}

void renderstate_set_texture(renderstate *self, int texture_index) {
    graphics_bind_texture(GL_TEXTURE0, self->textures[texture_index]->id);

#ifdef RENDER_STATE_DEBUG
    printf("render state bind texture := %d\n", self->textures[texture_index]->id);
#endif
}
