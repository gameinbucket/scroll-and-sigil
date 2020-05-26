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
#include "math/quaternion.h"
#include "wad/parser.h"

#include "cube.h"

typedef struct transform transform;

struct transform {
    float position[3];
    float rotation[4];
};

typedef struct animation animation;

struct animation {
    string *name;
    float *frames;
    int frame_count;
};

struct model_cube {
    float size[3];
    float pivot[3];
    float origin[3];
    float rotation[4];
};

typedef struct bone bone;

struct bone {
    string *name;
    bone *parent;
    bone **child;
    int child_count;
    int index;
    transform local;
    transform bind_pose;
    float bind_pose_matrix[16];
    float inverse_bind_pose_matrix[16];
    float *cubes;
    struct model_cube *cube_info;
    int cube_count;
};

typedef struct model_info model_info;

struct model_info {
    string *texture;
    int texture_id;
    bone *bones;
    int bone_count;
    bone *master;
    animation *animations;
    int animation_count;
};

typedef struct model model;

struct model {
    model_info *info;
    int current_animation;
    int previous_animation;
    int current_frame;
    int previous_frame;
};

int model_bone_index_of_name(model_info *self, string *name);
int model_animation_index_of_name(model_info *self, char *name);
model_info *model_parse(wad_element *model_wad, wad_element *animation_wad);
model *create_model(model_info *info);

#endif
