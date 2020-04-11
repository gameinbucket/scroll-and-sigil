#ifndef FRAME_BUFFER_H
#define FRAME_BUFFER_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

struct framebuffer {
    int width;
    int height;
    bool is_linear;
    bool has_depth;
    GLuint fbo;
    GLint *internal_formats;
    GLint *formats;
    GLint *texture_types;
    GLint *textures;
    GLint *draw_buffers;
    GLint depth_texture;
};

typedef struct framebuffer framebuffer;

framebuffer *framebuffer_init(int width, int height, int len, GLint *internal_formats, GLint *formats, GLint *types, bool is_linear, bool has_depth);
void framebuffer_resize(framebuffer *self, int width, int height);

#endif
