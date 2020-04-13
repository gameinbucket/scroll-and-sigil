#ifndef VEC_H
#define VEC_H

#include <stdbool.h>

#include "core/mem.h"

typedef struct vec vec;

struct vec {
    float x;
    float y;
};

typedef struct vec_ok vec_ok;

struct vec_ok {
    vec v;
    bool ok;
};

vec *vec_init(float x, float y);

#endif
