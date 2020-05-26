#ifndef SHADOW_MAP_H
#define SHADOW_MAP_H

#include <GL/glew.h>

#include "x-gl.h"

#include <float.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "math/matrix.h"
#include "math/vector.h"

struct shadowmap {
    int size;
    GLuint fbo;
    GLuint *draw_buffers;
    GLint depth_texture;
};

typedef struct shadowmap shadowmap;

shadowmap *create_shadowmap(int size);
void shadow_map_view_projection(shadowmap *shadow, float *out, float *shadow_view, float *view_projection);

#endif
