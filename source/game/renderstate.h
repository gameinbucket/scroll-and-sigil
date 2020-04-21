#ifndef RENDER_STATE_H
#define RENDER_STATE_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

#include "graphics/framebuffer.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/renderbuffer.h"
#include "graphics/shader.h"
#include "graphics/texture.h"

typedef struct renderstate renderstate;

struct renderstate {
    int canvas_width;
    int canvas_height;
    renderbuffer *draw_frame;
    renderbuffer *draw_canvas;
    renderbuffer *draw_images;
    renderbuffer *draw_colors;
    renderbuffer *draw_sectors;
    renderbuffer *draw_sprites;
    float canvas_orthographic[16];
    float draw_orthographic[16];
    float draw_perspective[16];
    float draw_inverse_perspective[16];
    float draw_inverse_modelview[16];
    float draw_current_to_previous_modelviewprojection[16];
    float view[16];
    float mv[16];
    float mvp[16];
    framebuffer *frame;
    shader **shaders;
    texture **textures;
    shader *active_shader;
};

renderstate *new_renderstate();

void renderstate_resize(renderstate *self, int screen_width, int screen_height);
void renderstate_set_mvp(renderstate *self, float *mvp);
void renderstate_set_program(renderstate *self, int shader_index);
void renderstate_set_texture(renderstate *self, int texture_index);

void destroy_renderstate(renderstate *self);

#endif
