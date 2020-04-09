#ifndef TEXTURES_H
#define TEXTURES_H

#include "core/file.h"

#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

GLint load_gl_texture(char *path);

#endif
