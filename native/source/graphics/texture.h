#ifndef TEXTURE_H
#define TEXTURE_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

#include "image.h"

typedef struct texture texture;

struct texture {
    GLuint id;
    int width;
    int height;
};

texture *texture_make(char *path, GLint clamp, GLint interpolate);

#endif
