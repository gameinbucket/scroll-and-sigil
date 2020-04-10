#include "framebuffer.h"

framebuffer *framebuffer_init(int width, int height, int len, GLint *internal_formats, GLint *formats, GLint *types, bool is_linear, bool has_depth) {
    framebuffer *f = safe_malloc(sizeof(framebuffer));
    f->width = width;
    f->height = height;
    f->is_linear = is_linear;
    f->has_depth = has_depth;
    f->internal_formats = internal_formats;
    f->formats = formats;
    f->texture_types = types;
    f->textures = safe_malloc(sizeof(GLint) * len);
    f->draw_buffers = safe_malloc(sizeof(GLint) * len);
    return f;
}

void framebuffer_resize(framebuffer *self, int width, int height) {
    self->width = width;
    self->height = height;
    // graphics_update_framebuffer(self);
}

void make_fbo(framebuffer *f) {
    GLuint fbo;
    glGenFramebuffers(1, &fbo);
    f->fbo = fbo;
}
