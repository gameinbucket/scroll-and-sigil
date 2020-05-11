#ifndef FRAME_BUFFER_H
#define FRAME_BUFFER_H

#include <GL/glew.h>

#include "x-gl.h"

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
    GLint interpolate;
    bool has_depth;
    GLuint fbo;
    GLint *internal_formats;
    GLint *formats;
    GLint *texture_types;
    GLuint *textures;
    GLuint *draw_buffers;
    GLint depth_texture;
    int texture_count;
};

typedef struct framebuffer framebuffer;

framebuffer *framebuffer_init(int width, int height, int texture_count, GLint *internal_formats, GLint *formats, GLint *types, GLint interpolate, bool has_depth);

#endif
