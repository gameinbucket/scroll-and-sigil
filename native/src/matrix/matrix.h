#ifndef MATRIX_H
#define MATRIX_H

extern float matrix_temp[16];
extern float matrix_copy[16];

void matrix_identify(float *matrix);
void matrix_orthographic(float *matrix, float left, float right, float bottom, float top, float near, float far);

#endif
