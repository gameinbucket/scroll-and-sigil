#ifndef VECTOR_H
#define VECTOR_H

#include <math.h>
#include <stdio.h>
#include <string.h>

#include "core/math.h"

float vector_dot(float *a, float *b);
void vector_cross(float *cross, float *a, float *b);
void vector_normalize(float *vec);

#endif
