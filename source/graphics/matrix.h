#ifndef MATRIX_H
#define MATRIX_H

#include <math.h>
#include <stdio.h>

void matrix_print(float *matrix);
void matrix_identity(float *matrix);
void matrix_orthographic(float *matrix, float left, float right, float bottom, float top, float near, float far);
void matrix_frustum(float *matrix, float left, float right, float bottom, float top, float near, float far);
void matrix_perspective(float *matrix, float fov, float near, float far, float aspect);
void matrix_translate(float *matrix, float x, float y, float z);
void matrix_multiply(float *matrix, float *from, float *temp);
void matrix_rotate_x(float *matrix, float sine, float cosine);
void matrix_rotate_y(float *matrix, float sine, float cosine);
void matrix_rotate_z(float *matrix, float sine, float cosine);
void matrix_inverse(float *matrix, float *from);
void matrix_orthographic_projection(float *mv, float *orthographic, float *mvp, float x, float y);
void matrix_perspective_projection(float *mv, float *perspective, float *mvp, float x, float y, float z, float rx, float ry);

#endif
