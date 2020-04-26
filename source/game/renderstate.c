#include "renderstate.h"

renderstate *new_renderstate() {
    return safe_calloc(1, sizeof(renderstate));
}

void renderstate_resize(renderstate *self, int screen_width, int screen_height) {

    self->canvas_width = screen_width;
    self->canvas_height = screen_height;

    float draw_percent = 1.0;

    int draw_width = screen_width * draw_percent;
    int draw_height = screen_height * draw_percent;

    float fov = 60.0;
    float ratio = (float)draw_width / (float)draw_height;

    matrix_orthographic(self->canvas_orthographic, 0, screen_width, 0, screen_height, 0, 1);
    matrix_orthographic(self->draw_orthographic, 0, draw_width, 0, draw_height, 0, 1);

    matrix_perspective(self->draw_perspective, fov, 0.01, 100, ratio);

    if (self->frame == NULL) {

        self->draw_frame = renderbuffer_init(2, 0, 0, 4, 6, false);
        self->draw_canvas = renderbuffer_init(2, 0, 0, 4, 6, false);
        self->draw_images = renderbuffer_init(2, 0, 2, 40, 60, true);
        self->draw_colors = renderbuffer_init(2, 3, 0, 40, 60, true);

        graphics_make_vao(self->draw_frame);
        graphics_make_vao(self->draw_canvas);
        graphics_make_vao(self->draw_images);
        graphics_make_vao(self->draw_colors);

        int texture_count = 1;

        GLint *internal = safe_malloc(sizeof(GLint) * texture_count);
        GLint *format = safe_malloc(sizeof(GLint) * texture_count);
        GLint *texture_type = safe_malloc(sizeof(GLint) * texture_count);

        internal[0] = GL_RGB;
        format[0] = GL_RGB;
        texture_type[0] = GL_UNSIGNED_BYTE;

        framebuffer *frame = framebuffer_init(draw_width, draw_height, texture_count, internal, format, texture_type, GL_NEAREST, true);
        graphics_make_fbo(frame);

        self->frame = frame;

        shadowmap *shadow_map = alloc_shadowmap(1024, 1024);
        graphics_make_shadow_map(shadow_map);

        self->shadow_map = shadow_map;

    } else {
        graphics_framebuffer_resize(self->frame, draw_width, draw_height);
    }

    renderbuffer_zero(self->draw_frame);
    renderbuffer_zero(self->draw_canvas);

    render_screen(self->draw_frame, 0, 0, draw_width, draw_height);
    render_screen(self->draw_canvas, 0, 0, screen_width, screen_height);

    graphics_update_vao(self->draw_frame, GL_STATIC_DRAW);
    graphics_update_vao(self->draw_canvas, GL_STATIC_DRAW);
}

void renderstate_set_mvp(renderstate *self, float *mvp) {
    glUniformMatrix4fv(self->active_shader->u_mvp, 1, GL_FALSE, mvp);
}

void renderstate_set_uniform_matrix(renderstate *self, char *name, float *mvp) {
    GLint location = glGetUniformLocation(self->active_shader->id, name);
    glUniformMatrix4fv(location, 1, GL_FALSE, mvp);
}

void renderstate_set_program(renderstate *self, int shader_index) {
    shader *s = self->shaders[shader_index];
    self->active_shader = s;
    glUseProgram(s->id);
}

void renderstate_set_texture(renderstate *self, int texture_index) {
    graphics_bind_texture(GL_TEXTURE0, self->textures[texture_index]->id);
}

void destroy_renderstate(renderstate *self) {
    printf("destroy renderstate %p\n", (void *)self);
}
