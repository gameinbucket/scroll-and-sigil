#ifndef CUBE_H
#define CUBE_H

#define STRIDE 8
#define CUBE_VERTEX_COUNT (24 * STRIDE)

#define RENDER_CUBE(x, y, z)                                                                                                                                                                           \
    {                                                                                                                                                                                                  \
        x, -y, -z, 0, 0, 1, 0, 0,       /* pos x 0 */                                                                                                                                                  \
            x, y, -z, 1, 0, 1, 0, 0,    /* pos x 1 */                                                                                                                                                  \
            x, y, z, 1, 1, 1, 0, 0,     /* pos x 2 */                                                                                                                                                  \
            x, -y, z, 0, 1, 1, 0, 0,    /* pos x 3 */                                                                                                                                                  \
            -x, -y, -z, 0, 0, -1, 0, 0, /* neg x 0 */                                                                                                                                                  \
            -x, -y, z, 0, 1, -1, 0, 0,  /* neg x 1 */                                                                                                                                                  \
            -x, y, z, 1, 1, -1, 0, 0,   /* neg x 2 */                                                                                                                                                  \
            -x, y, -z, 1, 0, -1, 0, 0,  /* neg x 3 */                                                                                                                                                  \
            -x, y, -z, 0, 0, 0, 1, 0,   /* pos y 0 */                                                                                                                                                  \
            -x, y, z, 0, 1, 0, 1, 0,    /* pos y 1 */                                                                                                                                                  \
            x, y, z, 1, 1, 0, 1, 0,     /* pos y 2 */                                                                                                                                                  \
            x, y, -z, 1, 0, 0, 1, 0,    /* pos y 3 */                                                                                                                                                  \
            -x, -y, -z, 0, 0, 0, -1, 0, /* neg y 0 */                                                                                                                                                  \
            x, -y, -z, 1, 0, 0, -1, 0,  /* neg y 1 */                                                                                                                                                  \
            x, -y, z, 1, 1, 0, -1, 0,   /* neg y 2 */                                                                                                                                                  \
            -x, -y, z, 0, 1, 0, -1, 0,  /* neg y 3 */                                                                                                                                                  \
            x, -y, z, 1, 0, 0, 0, 1,    /* pos z 0 */                                                                                                                                                  \
            x, y, z, 1, 1, 0, 0, 1,     /* pos z 1 */                                                                                                                                                  \
            -x, y, z, 0, 1, 0, 0, 1,    /* pos z 2 */                                                                                                                                                  \
            -x, -y, z, 0, 0, 0, 0, 1,   /* pos z 3 */                                                                                                                                                  \
            -x, -y, -z, 0, 0, 0, 0, -1, /* neg z 0 */                                                                                                                                                  \
            -x, y, -z, 0, 1, 0, 0, -1,  /* neg z 1 */                                                                                                                                                  \
            x, y, -z, 1, 1, 0, 0, -1,   /* neg z 2 */                                                                                                                                                  \
            x, -y, -z, 1, 0, 0, 0, -1,  /* neg z 3 */                                                                                                                                                  \
    }

#define CUBE_MODEL_STRIDE 9
#define CUBE_MODEL_VERTEX_COUNT (24 * CUBE_MODEL_STRIDE)
#define CUBE_MODEL_VERTEX_BYTES (CUBE_MODEL_VERTEX_COUNT * sizeof(float))
#define CUBE_FRONT 0
#define CUBE_BACK 1
#define CUBE_TOP 2
#define CUBE_BOTTOM 3
#define CUBE_LEFT 4
#define CUBE_RIGHT 5

#define RENDER_CUBE_MODEL(x, y, z, i)                                                                                                                                                                  \
    {                                                                                                                                                                                                  \
        x, -y, -z, 0, 0, 1, 0, 0, i,       /* pos x 0 */                                                                                                                                               \
            x, y, -z, 1, 0, 1, 0, 0, i,    /* pos x 1 */                                                                                                                                               \
            x, y, z, 1, 1, 1, 0, 0, i,     /* pos x 2 */                                                                                                                                               \
            x, -y, z, 0, 1, 1, 0, 0, i,    /* pos x 3 */                                                                                                                                               \
            -x, -y, -z, 0, 0, -1, 0, 0, i, /* neg x 0 */                                                                                                                                               \
            -x, -y, z, 0, 1, -1, 0, 0, i,  /* neg x 1 */                                                                                                                                               \
            -x, y, z, 1, 1, -1, 0, 0, i,   /* neg x 2 */                                                                                                                                               \
            -x, y, -z, 1, 0, -1, 0, 0, i,  /* neg x 3 */                                                                                                                                               \
            -x, y, -z, 0, 0, 0, 1, 0, i,   /* pos y 0 */                                                                                                                                               \
            -x, y, z, 0, 1, 0, 1, 0, i,    /* pos y 1 */                                                                                                                                               \
            x, y, z, 1, 1, 0, 1, 0, i,     /* pos y 2 */                                                                                                                                               \
            x, y, -z, 1, 0, 0, 1, 0, i,    /* pos y 3 */                                                                                                                                               \
            -x, -y, -z, 0, 0, 0, -1, 0, i, /* neg y 0 */                                                                                                                                               \
            x, -y, -z, 1, 0, 0, -1, 0, i,  /* neg y 1 */                                                                                                                                               \
            x, -y, z, 1, 1, 0, -1, 0, i,   /* neg y 2 */                                                                                                                                               \
            -x, -y, z, 0, 1, 0, -1, 0, i,  /* neg y 3 */                                                                                                                                               \
            x, -y, z, 1, 0, 0, 0, 1, i,    /* pos z 0 */                                                                                                                                               \
            x, y, z, 1, 1, 0, 0, 1, i,     /* pos z 1 */                                                                                                                                               \
            -x, y, z, 0, 1, 0, 0, 1, i,    /* pos z 2 */                                                                                                                                               \
            -x, -y, z, 0, 0, 0, 0, 1, i,   /* pos z 3 */                                                                                                                                               \
            -x, -y, -z, 0, 0, 0, 0, -1, i, /* neg z 0 */                                                                                                                                               \
            -x, y, -z, 0, 1, 0, 0, -1, i,  /* neg z 1 */                                                                                                                                               \
            x, y, -z, 1, 1, 0, 0, -1, i,   /* neg z 2 */                                                                                                                                               \
            x, -y, -z, 1, 0, 0, 0, -1, i,  /* neg z 3 */                                                                                                                                               \
    }

void texture_cube_model(float *cube, int side, float x, float y, float z, float w);

#endif
