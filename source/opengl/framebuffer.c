#include "framebuffer.h"

framebuffer *framebuffer_init(int width, int height, int texture_count, GLint *internal_formats, GLint *formats, GLint *types, GLint interpolate, bool has_depth) {
    size_t texutre_bytes = texture_count * sizeof(GLint);
    framebuffer *f = safe_malloc(sizeof(framebuffer));
    f->width = width;
    f->height = height;
    f->interpolate = interpolate;
    f->has_depth = has_depth;
    f->internal_formats = safe_malloc(texutre_bytes);
    f->formats = safe_malloc(texutre_bytes);
    f->texture_types = safe_malloc(texutre_bytes);
    f->textures = safe_malloc(sizeof(GLuint) * texture_count);
    f->draw_buffers = safe_malloc(sizeof(GLuint) * texture_count);
    f->texture_count = texture_count;
    memcpy(f->internal_formats, internal_formats, texutre_bytes);
    memcpy(f->formats, formats, texutre_bytes);
    memcpy(f->texture_types, types, texutre_bytes);
    return f;
}
