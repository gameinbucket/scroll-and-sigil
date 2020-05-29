#include "renderstate.h"

renderstate *create_renderstate(wad_element *settings) {
    renderstate *self = safe_calloc(1, sizeof(renderstate));
    self->ssao_on = wad_get_bool(wad_get_from_object(settings, "ssao"));
    return self;
}

void renderstate_resize(renderstate *self, int screen_width, int screen_height) {

    self->canvas_width = screen_width;
    self->canvas_height = screen_height;

    float draw_percent = 1.0;

    int draw_width = screen_width * draw_percent;
    int draw_height = screen_height * draw_percent;

    float fov = 60.0;
    float ratio = (float)draw_width / (float)draw_height;
    float near = 0.01;
    float far = 50.0;

    matrix_orthographic(self->canvas_orthographic, 0, screen_width, 0, screen_height, 0, 1);
    matrix_orthographic(self->draw_orthographic, 0, draw_width, 0, draw_height, 0, 1);
    matrix_orthographic(self->draw_orthographic_half, 0, draw_width * 0.5f, 0, draw_height * 0.5f, 0, 1);

    matrix_perspective(self->draw_perspective, fov, near, far, ratio);

    if (self->frame == NULL) {

        self->draw_canvas = create_renderbuffer(2, 0, 0, 0, 0, 4, 6, false);
        self->draw_frame = create_renderbuffer(2, 0, 0, 0, 0, 4, 6, false);
        self->draw_frame_half = create_renderbuffer(2, 0, 0, 0, 0, 4, 6, false);
        self->draw_images = create_renderbuffer(2, 3, 2, 0, 0, 80, 120, false);
        self->draw_colors = create_renderbuffer(2, 4, 0, 0, 0, 40, 60, false);

        graphics_make_vao(self->draw_canvas);
        graphics_make_vao(self->draw_frame);
        graphics_make_vao(self->draw_frame_half);
        graphics_make_vao(self->draw_images);
        graphics_make_vao(self->draw_colors);

        {
            int texture_count = 1;
            GLint internal[1] = {GL_RGB};
            GLint format[1] = {GL_RGB};
            GLint texture_type[1] = {GL_UNSIGNED_BYTE};
            self->frame = framebuffer_init(draw_width, draw_height, texture_count, internal, format, texture_type, GL_NEAREST, true);
        }

        {
            int texture_count = 3;
            GLint internal[3] = {GL_RGB, GL_RG16F, GL_RGB16F};
            GLint format[3] = {GL_RGB, GL_RG, GL_RGB};
            GLint texture_type[3] = {GL_UNSIGNED_BYTE, GL_FLOAT, GL_FLOAT};
            self->gbuffer = framebuffer_init(draw_width, draw_height, texture_count, internal, format, texture_type, GL_NEAREST, true);
        }

        {
            int texture_count = 1;
            GLint internal[1] = {GL_RGB16F};
            GLint format[1] = {GL_RGB};
            GLint texture_type[1] = {GL_FLOAT};
            self->frame_ping = framebuffer_init(draw_width, draw_height, texture_count, internal, format, texture_type, GL_NEAREST, false);
            self->frame_pong = framebuffer_init(draw_width, draw_height, texture_count, internal, format, texture_type, GL_NEAREST, false);
        }

        graphics_make_fbo(self->frame);
        graphics_make_fbo(self->gbuffer);
        graphics_make_fbo(self->frame_ping);
        graphics_make_fbo(self->frame_pong);

        shadowmap *shadow_map = create_shadowmap(1024);
        graphics_make_shadow_map(shadow_map);

        self->shadow_map = shadow_map;

        self->ssao_on = true;

        if (self->ssao_on) {
            const int sample_size = 64 * 3;
            self->ssao_samples = safe_malloc(sample_size * sizeof(float));
            for (int i = 0; i < sample_size; i += 3) {
                self->ssao_samples[i] = 2.0f * rand_float() - 1.0f;
                self->ssao_samples[i + 1] = 2.0f * rand_float() - 1.0f;
                self->ssao_samples[i + 2] = (float)rand() / (float)RAND_MAX;
                vector3f_normalize(&self->ssao_samples[i]);
                float multiple = (float)rand() / (float)RAND_MAX;
                self->ssao_samples[i] *= multiple;
                self->ssao_samples[i + 1] *= multiple;
                self->ssao_samples[i + 2] *= multiple;
                float scale = (float)i / 64.0f;
                scale = lerp(0.1f, 1.0f, scale * scale);
                self->ssao_samples[i] *= scale;
                self->ssao_samples[i + 1] *= scale;
                self->ssao_samples[i + 2] *= scale;
            }

            const int noise_size = 16 * 3;
            float noise_pixels[noise_size];
            for (int i = 0; i < noise_size; i += 3) {
                noise_pixels[i] = 2.0f * rand_float() - 1.0f;
                noise_pixels[i + 1] = 2.0f * rand_float() - 1.0f;
                noise_pixels[i + 2] = 0.0f;
            }

            self->ssao_noise = create_texture_pixels(4, 4, GL_REPEAT, GL_NEAREST, GL_RGB32F, GL_RGB, GL_FLOAT, noise_pixels);
        }

    } else {
        graphics_framebuffer_resize(self->frame, draw_width, draw_height);
    }

    renderbuffer_zero(self->draw_canvas);
    renderbuffer_zero(self->draw_frame);
    renderbuffer_zero(self->draw_frame_half);

    render_screen(self->draw_canvas, 0, 0, screen_width, screen_height);
    render_screen(self->draw_frame, 0, 0, draw_width, draw_height);
    render_screen(self->draw_frame_half, 0, 0, draw_width * 0.5f, draw_height * 0.5f);

    graphics_update_vao(self->draw_canvas, GL_STATIC_DRAW);
    graphics_update_vao(self->draw_frame, GL_STATIC_DRAW);
    graphics_update_vao(self->draw_frame_half, GL_STATIC_DRAW);
}

void renderstate_set_mvp(renderstate *self, float *mvp) {
    glUniformMatrix4fv(self->active_shader->u_mvp, 1, GL_FALSE, mvp);
}

void renderstate_set_uniform_matrix(renderstate *self, char *name, float *matrix) {
    GLint location = glGetUniformLocation(self->active_shader->id, name);
    glUniformMatrix4fv(location, 1, GL_FALSE, matrix);
}

void renderstate_set_uniform_matrices(renderstate *self, char *name, float *matrices, size_t count) {
    GLint location = glGetUniformLocation(self->active_shader->id, name);
    glUniformMatrix4fv(location, count, GL_FALSE, matrices);
}

void renderstate_set_uniform_vector2(renderstate *self, char *name, float x, float y) {
    GLint location = glGetUniformLocation(self->active_shader->id, name);
    glUniform2f(location, x, y);
}

void renderstate_set_uniform_vector(renderstate *self, char *name, float x, float y, float z) {
    GLint location = glGetUniformLocation(self->active_shader->id, name);
    glUniform3f(location, x, y, z);
}

void renderstate_set_uniform_vectors(renderstate *self, char *name, float *vectors, size_t count) {
    GLint location = glGetUniformLocation(self->active_shader->id, name);
    glUniform3fv(location, count, vectors);
}

void renderstate_set_program(renderstate *self, int shader_index) {
    shader *s = self->shaders[shader_index];
    self->active_shader = s;
    glUseProgram(s->id);
}

void renderstate_set_texture(renderstate *self, int texture_index) {
    graphics_bind_texture(GL_TEXTURE0, self->textures[texture_index]->id);
}

void delete_renderstate(renderstate *self) {
    printf("delete renderstate %p\n", (void *)self);
}
