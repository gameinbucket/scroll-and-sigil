#ifndef TEXTURE_H
#define TEXTURE_H

#include <GL/glew.h>

#include "x-gl.h"

#include <SDL2/SDL.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <zip.h>

#include "core/archive.h"
#include "core/mem.h"

#include "graphics/image.h"

typedef struct texture texture;

struct texture {
    string *path;
    GLuint id;
    int width;
    int height;
};

texture *texture_make(struct zip *z, char *path, GLint clamp, GLint interpolate);
texture *create_texture_pixels(int width, int height, GLint clamp, GLint interpolate, GLint internal_format, GLint format, GLint type, const void *pixels);

#endif
