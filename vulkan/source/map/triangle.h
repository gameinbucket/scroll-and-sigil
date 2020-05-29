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
    float u1;
    float v1;
    float u2;
    float v2;
    float u3;
    float v3;
    float normal;
};

triangle *create_triangle(float height, int texture, vec va, vec vb, vec vc, bool floor, float scale);

#endif
