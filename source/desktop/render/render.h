#ifndef RENDER_H
#define RENDER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "graphics/sprite.h"
#include "vulkan/vulkan_render_buffer.h"

#define CUBE_STRIDE 8
#define VK_CUBE_VERTEX_COUNT 24
#define VK_CUBE_VERTEX_FLOAT (VK_CUBE_VERTEX_COUNT * CUBE_STRIDE)
#define VK_CUBE_INDICE_COUNT 36

#define RENDER_VK_CUBE(x, y, z)                                                                                                                                                                        \
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

void render_index3(vulkan_render_buffer *b);
void render_index4(vulkan_render_buffer *b);
void render_screen(vulkan_render_buffer *b, float x, float y, float width, float height);
void render_rectangle(vulkan_render_buffer *b, float x, float y, float width, float height, float red, float green, float blue, float alpha);
void render_image(vulkan_render_buffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom);
void render_colored_image(vulkan_render_buffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom, float red, float green, float blue);
void render_text(vulkan_render_buffer *b, int x, int y, string *text, int scale, float red, float green, float blue);
void render_sprite(vulkan_render_buffer *b, float x, float y, float z, sprite *s, float sine, float cosine);
void render_aligned_sprite(vulkan_render_buffer *b, float x, float y, float z, sprite *s, float *view);
void render_cube(vulkan_render_buffer *b);

#endif
