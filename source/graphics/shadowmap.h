#ifndef SHADOW_MAP_H
#define SHADOW_MAP_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <float.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

#include "matrix.h"
#include "vector.h"

struct shadowmap {
    int width;
    int height;
    GLuint fbo;
    GLuint *draw_buffers;
    GLint depth_texture;
};

typedef struct shadowmap shadowmap;

shadowmap *alloc_shadowmap(int width, int height);
void shadow_map_view_projection(float *matrix, float *shadow_view, float *view, float *view_projection);

#endif
