#include "cube.h"

void texture_cube_model(float *cube, int side, float x, float y, float z, float w) {

    int i = CUBE_MODEL_STRIDE * side * 4;
    cube[i + 3] = x;
    cube[i + 4] = y;

    i += CUBE_MODEL_STRIDE;
    cube[i + 3] = z;
    cube[i + 4] = y;

    i += CUBE_MODEL_STRIDE;
    cube[i + 3] = z;
    cube[i + 4] = w;

    i += CUBE_MODEL_STRIDE;
    cube[i + 3] = x;
    cube[i + 4] = w;
}
