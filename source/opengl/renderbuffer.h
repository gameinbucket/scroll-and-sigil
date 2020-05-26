#ifndef RENDER_BUFFER_H
#define RENDER_BUFFER_H

#include <GL/glew.h>

#include "x-gl.h"

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

typedef struct renderbuffer renderbuffer;

struct renderbuffer {
    int position;
    int color;
    int texture;
    int normal;
    int bone;
    GLint vao;
    GLint vbo;
    GLint ebo;
    GLsizei vertex_pos;
    size_t vertex_size;
    GLsizei index_pos;
    size_t index_size;
    int index_offset;
    GLfloat *vertices;
    GLuint *indices;
    bool map_buffer_range;
};

renderbuffer *create_renderbuffer(int position, int color, int texture, int normal, int bone, int vertex_limit, int index_limit, bool map_buffer_range);
void renderbuffer_zero(renderbuffer *self);
void renderbuffer_free(renderbuffer *self);

#endif
