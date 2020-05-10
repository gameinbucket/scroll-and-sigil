#ifndef MODEL_H
#define MODEL_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "wad/parser.h"

#include "cube.h"
#include "matrix.h"

typedef struct animation animation;

struct animation {
    float *transforms[16];
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

    float plane_offset_x;
    float plane_offset_y;
    float plane_offset_z;
    float bone_offset_x;
    float bone_offset_y;
    float bone_offset_z;
    float local_rx;
    float local_ry;
    float aggregate_rx;
    float aggregate_ry;
    float sin_x;
    float cos_x;
    float sin_y;
    float cos_y;
    float world_x;
    float world_y;
    float world_z;
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

void bone_recursive_join(bone *b, bone *parent);
void bone_recursive_compute(bone *b);

void bone_init(bone *bones, int index, float width, float height, float length);
void bone_offset(bone *b, float x, float y, float z);
void bone_plane_offset(bone *b, float x, float y, float z);
void bone_attached(bone *b, int count);

model *model_parse(wad_element *model_wad, wad_element *animation_wad);

#endif
