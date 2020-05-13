#ifndef MODEL_H
#define MODEL_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "math/matrix.h"
#include "wad/parser.h"

#include "cube.h"

typedef struct animation animation;

struct animation {
    string *name;
    float *frames;
    int frame_count;
};

typedef struct bone bone;

struct bone {
    string *name;
    bone *parent;
    bone **child;
    int child_count;
    int index;
    float width;
    float height;
    float length;
    float relative[16];
    float bind_pose[16];
    float inverse_bind_pose[16];
    float cube[CUBE_MODEL_VERTEX_COUNT];
};

typedef struct model model;

struct model {
    string *texture;
    int texture_id;
    bone *bones;
    int bone_count;
    bone *master;
    animation *animations;
    int animation_count;
};

int model_bone_index_of_name(model *self, string *name);
int model_animation_index_of_name(model *self, char *name);
model *model_parse(wad_element *model_wad, wad_element *animation_wad);

#endif
