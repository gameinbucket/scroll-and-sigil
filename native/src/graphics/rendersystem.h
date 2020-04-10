#ifndef RENDER_SYSTEM_H
#define RENDER_SYSTEM_H

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

struct rendersystem {
    float view[16];
    float modelview[16];
    float modelviewprojection[16];
    GLint program;
    string program_name;
    GLint *mvp_ids;
    GLint *texture_ids;
    GLint *shaders;
    GLint *textures;
};

typedef struct rendersystem rendersystem;

rendersystem *rendersystem_init();
void rendersystem_set_texture(rendersystem *self);

#endif
