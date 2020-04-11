#ifndef MATRIX_H
#define MATRIX_H

#include <math.h>

extern float matrix_temp[16];
extern float matrix_copy[16];

void matrix_identify(float *matrix);
void matrix_orthographic(float *matrix, float left, float right, float bottom, float top, float near, float far);
void matrix_frustum(float *matrix, float left, float right, float bottom, float top, float near, float far);
void matrix_perspective(float *matrix, float fov, float near, float far, float aspect);
void matrix_translate(float *matrix, float x, float y, float z);
void matrix_multiply(float *matrix, float *from, float *temp);
void matrix_rotate_x(float *matrix, float sine, float cosine);
void matrix_rotate_y(float *matrix, float sine, float cosine);
void matrix_rotate_z(float *matrix, float sine, float cosine);
void matrix_inverse(float *matrix, float *from);
void matrix_update_orthographic(float *orthographic, float x, float y, float *mvp, float *mv);
void matrix_update_perspective(float *perspective, float x, float y, float z, float rx, float ry, float *mvp, float *mv);

#endif
