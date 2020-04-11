#include "framebuffer.h"

framebuffer *framebuffer_init(int width, int height, int texture_count, GLint *internal_formats, GLint *formats, GLint *types, GLint interpolate, bool has_depth) {
    framebuffer *f = safe_malloc(sizeof(framebuffer));
    f->width = width;
    f->height = height;
    f->interpolate = interpolate;
    f->has_depth = has_depth;
    f->internal_formats = internal_formats;
    f->formats = formats;
    f->texture_types = types;
    f->textures = safe_malloc(sizeof(GLuint) * texture_count);
    f->draw_buffers = safe_malloc(sizeof(GLuint) * texture_count);
    f->texture_count = texture_count;
    return f;
}
