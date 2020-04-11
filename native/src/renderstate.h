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
#include "core/string.h"

#include "graphics/framebuffer.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/renderbuffer.h"
#include "graphics/texture.h"

struct renderstate {
    int canvas_width;
    int canvas_height;
    renderbuffer *screen;
    renderbuffer *frame_screen;
    renderbuffer *draw_images;
    renderbuffer *draw_colors;
    framebuffer *frame;
    float canvas_orthographic[16];
    float draw_orthographic[16];
    float draw_perspective[16];
    float draw_inverse_perspective[16];
    float draw_inverse_modelview[16];
    float draw_current_to_previous_modelviewprojection[16];
    float view[16];
    float modelview[16];
    float modelviewprojection[16];
    GLint program_id;
    string program_name;
    GLint *mvp_ids;
    GLint *uniforms;
    GLint *texture_ids;
    GLint *shaders;
    texture **textures;
};

typedef struct renderstate renderstate;

renderstate *renderstate_init();
void renderstate_resize(renderstate *self, int screen_width, int screen_height);
void renderstate_set_texture(renderstate *self);
void renderstate_set_program(renderstate *self, int shader_index);

#endif
