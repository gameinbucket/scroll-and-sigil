#include "cube.h"

void texture_cube_model(float *cube, int side, float x, float y, float z, float w) {

    int i = CUBE_MODEL_STRIDE * side * 4;
    cube[i + 3] = z;
    cube[i + 4] = y;

    i += CUBE_MODEL_STRIDE;
    cube[i + 3] = x;
    cube[i + 4] = y;

    i += CUBE_MODEL_STRIDE;
    cube[i + 3] = x;
    cube[i + 4] = w;

    i += CUBE_MODEL_STRIDE;
    cube[i + 3] = z;
    cube[i + 4] = w;
}

bool skip_cube_model_face(float *cube, int side) {
    int i = CUBE_MODEL_STRIDE * side * 4;
    return cube[i + 3] < 0.0f || cube[i + 4] < 0.0f;
}
