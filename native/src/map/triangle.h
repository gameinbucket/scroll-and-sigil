#ifndef TRIANGLE_H
#define TRIANGLE_H

#include <stdbool.h>

#include "core/mem.h"

#include "vec.h"

typedef struct triangle triangle;

struct triangle {
    float height;
    int texture;
    vec va;
    vec vb;
    vec vc;
    vec uv1;
    vec uv2;
    vec uv3;
    float normal;
};

triangle *triangle_init(float height, int texture, vec va, vec vb, vec vc, bool floor, float scale);

#endif
