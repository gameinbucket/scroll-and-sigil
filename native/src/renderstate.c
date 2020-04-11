#include "renderstate.h"

renderstate *renderstate_init() {
    return safe_calloc(1, sizeof(renderstate));
}

void renderstate_resize(renderstate *self, int screen_width, int screen_height) {

    int draw_width = screen_width;
    int draw_height = screen_height;

    float fov = 60.0;
    float ratio = (float)screen_width / (float)screen_height;

    matrix_orthographic(self->canvas_orthographic, 0.0, screen_width, 0.0, screen_height, 0.0, 1.0);
    matrix_orthographic(self->draw_orthographic, 0.0, draw_width, 0.0, draw_height, 0.0, 1.0);

    matrix_perspective(self->draw_perspective, fov, 0.01, 100.0, ratio);

    matrix_inverse(self->draw_inverse_perspective, self->draw_perspective);

    if (self->frame == NULL) {
        GLint internal[1] = {GL_RGB};
        GLint format[1] = {GL_RGB};
        GLint type[1] = {GL_UNSIGNED_BYTE};

        framebuffer *frame = framebuffer_init(draw_width, draw_height, 1, internal, format, type, true, true);
        graphics_make_fbo(frame);

        renderbuffer *screen = renderbuffer_init(2, 0, 0, 4, 6);
        graphics_make_vao(screen);

        self->frame = frame;
        self->screen = screen;

    } else {
        framebuffer_resize(self->frame, draw_width, draw_height);
    }

    renderbuffer_zero(self->screen);
}

void renderstate_set_texture(renderstate *self) {
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, self->textures[0]->id);
    glUniform1i(self->texture_ids[0], 0);
}

void renderstate_set_program(renderstate *self, int shader_index) {
    self->program_id = self->shaders[shader_index];
    glUseProgram(self->program_id);
}
