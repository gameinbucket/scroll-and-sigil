#ifndef TEXTURES_H
#define TEXTURES_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/file.h"
#include "core/mem.h"

struct texture_t {
    GLint id;
    int width;
    int height;
};

typedef struct texture_t texture_t;

texture_t *texture_init(GLint id, int width, int height);
texture_t *make_texture(char *path, GLint clamp, GLint interpolate);

#endif
