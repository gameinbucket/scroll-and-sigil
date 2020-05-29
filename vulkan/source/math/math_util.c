#include "math_util.h"

float rand_float() {
    return (float)rand() / (float)RAND_MAX;
}

float lerp(float x, float y, float t) {
    return x + t * (y - x);
}
