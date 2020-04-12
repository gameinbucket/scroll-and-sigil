#include "vec.h"

vec *vec_init(float x, float y) {
    vec *v = safe_malloc(sizeof(vec));
    v->x = x;
    v->y = y;
    return v;
}
