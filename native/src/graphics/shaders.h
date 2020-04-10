#ifndef SHADERS_H
#define SHADERS_H

#include "core/file.h"

#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

GLint make_program(char *vert, char *frag);

#endif
