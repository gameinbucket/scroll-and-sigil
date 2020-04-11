#include "matrix.h"

void matrix_identify(float *matrix) {

    matrix[0] = 1.0;
    matrix[1] = 0.0;
    matrix[2] = 0.0;
    matrix[3] = 0.0;

    matrix[4] = 0.0;
    matrix[5] = 1.0;
    matrix[6] = 0.0;
    matrix[7] = 0.0;

    matrix[8] = 0.0;
    matrix[9] = 0.0;
    matrix[10] = 1.0;
    matrix[11] = 0.0;

    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = 0.0;
    matrix[15] = 1.0;
}

void matrix_orthographic(float *matrix, float left, float right, float bottom, float top, float near, float far) {

    matrix[0] = 2.0 / (right - left);
    matrix[1] = 0.0;
    matrix[2] = 0.0;
    matrix[3] = 0.0;

    matrix[4] = 0.0;
    matrix[5] = 2.0 / (top - bottom);
    matrix[6] = 0.0;
    matrix[7] = 0.0;

    matrix[8] = 0.0;
    matrix[9] = 0.0;
    matrix[10] = -2.0 / (far - near);
    matrix[11] = 0.0;

    matrix[12] = -(right + left) / (right - left);
    matrix[13] = -(top + bottom) / (top - bottom);
    matrix[14] = -(far + near) / (far - near);
    matrix[15] = 1.0;
}

void matrix_frustum(float *matrix, float left, float right, float bottom, float top, float near, float far) {

    matrix[0] = (2.0 * near) / (right - left);
    matrix[1] = 0.0;
    matrix[2] = 0.0;
    matrix[3] = 0.0;

    matrix[4] = 0.0;
    matrix[5] = (2.0 * near) / (top - bottom);
    matrix[6] = 0.0;
    matrix[7] = 0.0;

    matrix[8] = (right + left) / (right - left);
    matrix[9] = (top + bottom) / (top - bottom);
    matrix[10] = -(far + near) / (far - near);
    matrix[11] = -1.0;

    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = -(2.0 * far * near) / (far - near);
    matrix[15] = 0.0;
}

void matrix_perspective(float *matrix, float fov, float near, float far, float aspect) {

    float top = near * fov;
    float bottom = -top;
    float left = bottom * aspect;
    float right = top * aspect;

    matrix_frustum(matrix, left, right, bottom, top, near, far);
}

void matrix_translate(float *matrix, float x, float y, float z) {

    matrix[12] = x * matrix[0] + y * matrix[4] + z * matrix[8] + matrix[12];
    matrix[13] = x * matrix[1] + y * matrix[5] + z * matrix[9] + matrix[13];
    matrix[14] = x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];
    matrix[15] = x * matrix[3] + y * matrix[7] + z * matrix[11] + matrix[15];
}

void matrix_multiply(float *matrix, float *from, float *temp) {

    matrix[0] = from[0] * temp[0] + from[4] * temp[1] + from[8] * temp[2] + from[12] * temp[3];
    matrix[1] = from[1] * temp[0] + from[5] * temp[1] + from[9] * temp[2] + from[13] * temp[3];
    matrix[2] = from[2] * temp[0] + from[6] * temp[1] + from[10] * temp[2] + from[14] * temp[3];
    matrix[3] = from[3] * temp[0] + from[7] * temp[1] + from[11] * temp[2] + from[15] * temp[3];

    matrix[4] = from[0] * temp[4] + from[4] * temp[5] + from[8] * temp[6] + from[12] * temp[7];
    matrix[5] = from[1] * temp[4] + from[5] * temp[5] + from[9] * temp[6] + from[13] * temp[7];
    matrix[6] = from[2] * temp[4] + from[6] * temp[5] + from[10] * temp[6] + from[14] * temp[7];
    matrix[7] = from[3] * temp[4] + from[7] * temp[5] + from[11] * temp[6] + from[15] * temp[7];

    matrix[8] = from[0] * temp[8] + from[4] * temp[9] + from[8] * temp[10] + from[12] * temp[11];
    matrix[9] = from[1] * temp[8] + from[5] * temp[9] + from[9] * temp[10] + from[13] * temp[11];
    matrix[10] = from[2] * temp[8] + from[6] * temp[9] + from[10] * temp[10] + from[14] * temp[11];
    matrix[11] = from[3] * temp[8] + from[7] * temp[9] + from[11] * temp[10] + from[15] * temp[11];

    matrix[12] = from[0] * temp[12] + from[4] * temp[13] + from[8] * temp[14] + from[12] * temp[15];
    matrix[13] = from[1] * temp[12] + from[5] * temp[13] + from[9] * temp[14] + from[13] * temp[15];
    matrix[14] = from[2] * temp[12] + from[6] * temp[13] + from[10] * temp[14] + from[14] * temp[15];
    matrix[15] = from[3] * temp[12] + from[7] * temp[13] + from[11] * temp[14] + from[15] * temp[15];
}

void matrix_rotate_x(float *matrix, float sine, float cosine) {

    float temp[16];

    temp[0] = 1.0;
    temp[1] = 0.0;
    temp[2] = 0.0;
    temp[3] = 0.0;

    temp[4] = 0.0;
    temp[5] = cosine;
    temp[6] = sine;
    temp[7] = 0.0;

    temp[8] = 0.0;
    temp[9] = -sine;
    temp[10] = cosine;
    temp[11] = 0.0;

    temp[12] = 0.0;
    temp[13] = 0.0;
    temp[14] = 0.0;
    temp[15] = 1.0;

    float copy[16];
    for (int i = 0; i < 16; i++) {
        copy[i] = matrix[i];
    }

    matrix_multiply(matrix, copy, temp);
}

void matrix_rotate_y(float *matrix, float sine, float cosine) {

    float temp[16];

    temp[0] = cosine;
    temp[1] = 0.0;
    temp[2] = -sine;
    temp[3] = 0.0;

    temp[4] = 0.0;
    temp[5] = 1.0;
    temp[6] = 0.0;
    temp[7] = 0.0;

    temp[8] = sine;
    temp[9] = 0.0;
    temp[10] = cosine;
    temp[11] = 0.0;

    temp[12] = 0.0;
    temp[13] = 0.0;
    temp[14] = 0.0;
    temp[15] = 1.0;

    float copy[16];
    for (int i = 0; i < 16; i++) {
        copy[i] = matrix[i];
    }

    matrix_multiply(matrix, copy, temp);
}

void matrix_rotate_z(float *matrix, float sine, float cosine) {

    float temp[16];

    temp[0] = cosine;
    temp[1] = sine;
    temp[2] = 0.0;
    temp[3] = 0.0;

    temp[4] = -sine;
    temp[5] = cosine;
    temp[6] = 0.0;
    temp[7] = 0.0;

    temp[8] = 0.0;
    temp[9] = 0.0;
    temp[10] = 1.0;
    temp[11] = 0.0;

    temp[12] = 0.0;
    temp[13] = 0.0;
    temp[14] = 0.0;
    temp[15] = 1.0;

    float copy[16];
    for (int i = 0; i < 16; i++) {
        copy[i] = matrix[i];
    }

    matrix_multiply(matrix, copy, temp);
}

void matrix_inverse(float *matrix, float *from) {

    float src[16];
    float dst[16];
    float tmp[16];

    for (int i = 0; i < 4; i++) {
        src[i + 0] = from[i * 4 + 0];
        src[i + 4] = from[i * 4 + 1];
        src[i + 8] = from[i * 4 + 2];
        src[i + 12] = from[i * 4 + 3];
    }

    tmp[0] = src[10] * src[15];
    tmp[1] = src[11] * src[14];
    tmp[2] = src[9] * src[15];
    tmp[3] = src[11] * src[13];
    tmp[4] = src[9] * src[14];
    tmp[5] = src[10] * src[13];
    tmp[6] = src[8] * src[15];
    tmp[7] = src[11] * src[12];
    tmp[8] = src[8] * src[14];
    tmp[9] = src[10] * src[12];
    tmp[10] = src[8] * src[13];
    tmp[11] = src[9] * src[12];

    dst[0] = tmp[0] * src[5] + tmp[3] * src[6] + tmp[4] * src[7];
    dst[0] -= tmp[1] * src[5] + tmp[2] * src[6] + tmp[5] * src[7];
    dst[1] = tmp[1] * src[4] + tmp[6] * src[6] + tmp[9] * src[7];
    dst[1] -= tmp[0] * src[4] + tmp[7] * src[6] + tmp[8] * src[7];
    dst[2] = tmp[2] * src[4] + tmp[7] * src[5] + tmp[10] * src[7];
    dst[2] -= tmp[3] * src[4] + tmp[6] * src[5] + tmp[11] * src[7];
    dst[3] = tmp[5] * src[4] + tmp[8] * src[5] + tmp[11] * src[6];
    dst[3] -= tmp[4] * src[4] + tmp[9] * src[5] + tmp[10] * src[6];
    dst[4] = tmp[1] * src[1] + tmp[2] * src[2] + tmp[5] * src[3];
    dst[4] -= tmp[0] * src[1] + tmp[3] * src[2] + tmp[4] * src[3];
    dst[5] = tmp[0] * src[0] + tmp[7] * src[2] + tmp[8] * src[3];
    dst[5] -= tmp[1] * src[0] + tmp[6] * src[2] + tmp[9] * src[3];
    dst[6] = tmp[3] * src[0] + tmp[6] * src[1] + tmp[11] * src[3];
    dst[6] -= tmp[2] * src[0] + tmp[7] * src[1] + tmp[10] * src[3];
    dst[7] = tmp[4] * src[0] + tmp[9] * src[1] + tmp[10] * src[2];
    dst[7] -= tmp[5] * src[0] + tmp[8] * src[1] + tmp[11] * src[2];

    tmp[0] = src[2] * src[7];
    tmp[1] = src[3] * src[6];
    tmp[2] = src[1] * src[7];
    tmp[3] = src[3] * src[5];
    tmp[4] = src[1] * src[6];
    tmp[5] = src[2] * src[5];
    tmp[6] = src[0] * src[7];
    tmp[7] = src[3] * src[4];
    tmp[8] = src[0] * src[6];
    tmp[9] = src[2] * src[4];
    tmp[10] = src[0] * src[5];
    tmp[11] = src[1] * src[4];

    dst[8] = tmp[0] * src[13] + tmp[3] * src[14] + tmp[4] * src[15];
    dst[8] -= tmp[1] * src[13] + tmp[2] * src[14] + tmp[5] * src[15];
    dst[9] = tmp[1] * src[12] + tmp[6] * src[14] + tmp[9] * src[15];
    dst[9] -= tmp[0] * src[12] + tmp[7] * src[14] + tmp[8] * src[15];
    dst[10] = tmp[2] * src[12] + tmp[7] * src[13] + tmp[10] * src[15];
    dst[10] -= tmp[3] * src[12] + tmp[6] * src[13] + tmp[11] * src[15];
    dst[11] = tmp[5] * src[12] + tmp[8] * src[13] + tmp[11] * src[14];
    dst[11] -= tmp[4] * src[12] + tmp[9] * src[13] + tmp[10] * src[14];
    dst[12] = tmp[2] * src[10] + tmp[5] * src[11] + tmp[1] * src[9];
    dst[12] -= tmp[4] * src[11] + tmp[0] * src[9] + tmp[3] * src[10];
    dst[13] = tmp[8] * src[11] + tmp[0] * src[8] + tmp[7] * src[10];
    dst[13] -= tmp[6] * src[10] + tmp[9] * src[11] + tmp[1] * src[8];
    dst[14] = tmp[6] * src[9] + tmp[11] * src[11] + tmp[3] * src[8];
    dst[14] -= tmp[10] * src[11] + tmp[2] * src[8] + tmp[7] * src[9];
    dst[15] = tmp[10] * src[10] + tmp[4] * src[8] + tmp[9] * src[9];
    dst[15] -= tmp[8] * src[9] + tmp[11] * src[10] + tmp[5] * src[8];

    float det = 1.0 / (src[0] * dst[0] + src[1] * dst[1] + src[2] * dst[2] + src[3] * dst[3]);

    for (int i = 0; i < 16; i++) {
        matrix[i] = dst[i] * det;
    }
}

void matrix_update_orthographic(float *orthographic, float x, float y, float *mvp, float *mv) {
    matrix_identify(mv);
    matrix_translate(mv, x, y, 0);
    matrix_multiply(mvp, orthographic, mv);
}

void matrix_update_perspective(float *perspective, float x, float y, float z, float rx, float ry, float *mvp, float *mv) {
    matrix_identify(mv);
    if (rx != 0.0) {
        float sine = sin(rx);
        float cosine = cos(rx);
        matrix_rotate_x(mv, sine, cosine);
    }
    if (ry != 0.0) {
        float sine = sin(ry);
        float cosine = cos(ry);
        matrix_rotate_x(mv, sine, cosine);
    }
    matrix_translate(mv, x, y, z);
    matrix_multiply(mvp, perspective, mv);
}
