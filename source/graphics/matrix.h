#ifndef MATRIX_H
#define MATRIX_H

#include <math.h>
#include <stdio.h>

#include "core/math.h"

#include "vector.h"

void matrix_print(float *matrix);
void matrix_identity(float *matrix);
void matrix_orthographic(float *matrix, float left, float right, float bottom, float top, float near, float far);
void matrix_frustum(float *matrix, float left, float right, float bottom, float top, float near, float far);
void matrix_perspective(float *matrix, float fov, float near, float far, float aspect);
void matrix_translate(float *matrix, float x, float y, float z);
void matrix_multiply(float *matrix, float *a, float *b);
void matrix_rotate_x(float *matrix, float sine, float cosine);
void matrix_rotate_y(float *matrix, float sine, float cosine);
void matrix_rotate_z(float *matrix, float sine, float cosine);
void matrix_inverse(float *matrix, float *from);
void matrix_look_at(float *matrix, float *eye, float *center);
void matrix_orthographic_projection(float *mvp, float *orthographic, float *mv, float x, float y);
void matrix_perspective_projection(float *mvp, float *perspective, float *mv, float x, float y, float z, float rx, float ry);

#endif
