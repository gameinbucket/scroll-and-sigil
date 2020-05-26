#ifndef SHADER_H
#define SHADER_H

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
#include "core/fileio.h"
#include "core/string_util.h"

struct shader {
    GLuint id;
    GLint u_mvp;
};

typedef struct shader shader;

shader *shader_make(struct zip *z, char *vert, char *frag);

#endif
