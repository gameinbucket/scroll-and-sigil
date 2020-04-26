#ifndef MODEL_H
#define MODEL_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

typedef struct animation animation;

struct animation {
    float rx;
    float ry;
};

typedef struct bone bone;

struct bone {
    bone *parent;
    bone **child;
    int child_count;
    float width;
    float height;
    float length;
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
    bone *bones;
    int bone_count;
    animation *animations;
};

void bone_recursive_join(bone *b, bone *parent);
void bone_recursive_compute(bone *b);

void bone_init(bone *b, float width, float height, float length, float scale);
void bone_offset(bone *b, float x, float y, float z);
void bone_plane_offset(bone *b, float x, float y, float z);
void bone_attached(bone *b, int count);

#endif
