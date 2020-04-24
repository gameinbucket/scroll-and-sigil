#include "vector.h"

float vector_dot(float *a, float *b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

void vector_cross(float *cross, float *a, float *b) {
    cross[0] = a[1] * b[2] - a[2] * b[1];
    cross[1] = a[2] * b[0] - a[0] * b[2];
    cross[2] = a[0] * b[1] - a[1] * b[0];
}

void vector_normalize(float *vec) {
    float magnitude = sqrtf(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    float multiple = 1.0f / magnitude;
    vec[0] *= multiple;
    vec[1] *= multiple;
    vec[2] *= multiple;
}
