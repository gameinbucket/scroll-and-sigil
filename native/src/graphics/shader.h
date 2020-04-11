#ifndef SHADER_H
#define SHADER_H

// #define SHADER_DEBUG

#include "core/file.h"
#include "core/string.h"

#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

struct shader {
    GLuint id;
    string name;
    GLint u_mvp;
};

typedef struct shader shader;

shader *shader_make(char *name, char *vert, char *frag);

#endif
