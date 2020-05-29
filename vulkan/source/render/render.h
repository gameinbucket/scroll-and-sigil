#ifndef RENDER_H
#define RENDER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "vulkan/vulkan_renderbuffer.h"

#define CUBE_STRIDE 8
#define CUBE_VERTEX_COUNT 24
#define CUBE_VERTEX_FLOAT (CUBE_VERTEX_COUNT * CUBE_STRIDE)
#define CUBE_INDICE_COUNT 36

#define RENDER_CUBE(x, y, z)                                                                                                                                                                           \
    {                                                                                                                                                                                                  \
        x, -y, -z, 1, 0, 0, 0, 0,      /* pos x 0 */                                                                                                                                                   \
            x, y, -z, 1, 0, 0, 1, 0,   /* pos x 1 */                                                                                                                                                   \
            x, y, z, 1, 0, 0, 1, 1,    /* pos x 2 */                                                                                                                                                   \
            x, -y, z, 1, 0, 0, 0, 1,   /* pos x 3 */                                                                                                                                                   \
            -x, -y, -z, 1, 0, 0, 0, 0, /* neg x 0 */                                                                                                                                                   \
            -x, -y, z, 1, 0, 0, 0, 1,  /* neg x 1 */                                                                                                                                                   \
            -x, y, z, 1, 0, 0, 1, 1,   /* neg x 2 */                                                                                                                                                   \
            -x, y, -z, 1, 0, 0, 1, 0,  /* neg x 3 */                                                                                                                                                   \
            -x, y, -z, 0, 1, 0, 0, 0,  /* pos y 0 */                                                                                                                                                   \
            -x, y, z, 0, 1, 0, 0, 1,   /* pos y 1 */                                                                                                                                                   \
            x, y, z, 0, 1, 0, 1, 1,    /* pos y 2 */                                                                                                                                                   \
            x, y, -z, 0, 1, 0, 1, 0,   /* pos y 3 */                                                                                                                                                   \
            -x, -y, -z, 0, 1, 0, 1, 0, /* neg y 0 */                                                                                                                                                   \
            x, -y, -z, 0, 1, 0, 1, 1,  /* neg y 1 */                                                                                                                                                   \
            x, -y, z, 0, 1, 0, 0, 1,   /* neg y 2 */                                                                                                                                                   \
            -x, -y, z, 1, 1, 1, 0, 0,  /* neg y 3 */                                                                                                                                                   \
            x, -y, z, 1, 1, 1, 1, 0,   /* pos z 0 */                                                                                                                                                   \
            x, y, z, 1, 1, 1, 1, 1,    /* pos z 1 */                                                                                                                                                   \
            -x, y, z, 1, 1, 1, 0, 1,   /* pos z 2 */                                                                                                                                                   \
            -x, -y, z, 1, 1, 1, 0, 0,  /* pos z 3 */                                                                                                                                                   \
            -x, -y, -z, 1, 1, 1, 0, 0, /* neg z 0 */                                                                                                                                                   \
            -x, y, -z, 1, 1, 1, 0, 1,  /* neg z 1 */                                                                                                                                                   \
            x, y, -z, 1, 1, 1, 1, 1,   /* neg z 2 */                                                                                                                                                   \
            x, -y, -z, 1, 1, 1, 1, 0   /* neg z 3 */                                                                                                                                                   \
    }

void render_index4(struct vulkan_renderbuffer *renderbuffer);
void render_screen(struct vulkan_renderbuffer *renderbuffer, float x, float y, float width, float height);
void render_cube(struct vulkan_renderbuffer *renderbuffer);

#endif
