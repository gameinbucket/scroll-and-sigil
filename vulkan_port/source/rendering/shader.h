#ifndef SHADER_H
#define SHADER_H

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
    char *foobar;
};

typedef struct shader shader;

shader *create_shader(struct zip *z, char *vert, char *frag);

#endif
