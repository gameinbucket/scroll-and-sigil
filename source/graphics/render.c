#include "render.h"

void render_index3(renderbuffer *b) {
    int pos = b->index_pos;
    int offset = b->index_offset;
    GLuint *indices = b->indices;
    indices[pos] = offset;
    indices[pos + 1] = offset + 1;
    indices[pos + 2] = offset + 2;
    b->index_pos = pos + 3;
    b->index_offset = offset + 3;
}

void render_index4(renderbuffer *b) {
    int pos = b->index_pos;
    int offset = b->index_offset;
    GLuint *indices = b->indices;
    indices[pos] = offset;
    indices[pos + 1] = offset + 1;
    indices[pos + 2] = offset + 2;
    indices[pos + 3] = offset + 2;
    indices[pos + 4] = offset + 3;
    indices[pos + 5] = offset;
    b->index_pos = pos + 6;
    b->index_offset = offset + 4;
}

void render_screen(renderbuffer *b, float x, float y, float width, float height) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;
    vertices[pos] = x;
    vertices[pos + 1] = y;
    vertices[pos + 2] = x + width;
    vertices[pos + 3] = y;
    vertices[pos + 4] = x + width;
    vertices[pos + 5] = y + height;
    vertices[pos + 6] = x;
    vertices[pos + 7] = y + height;
    b->vertex_pos = pos + 8;
    render_index4(b);
}

void render_image(renderbuffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = x;
    vertices[pos + 1] = y;
    vertices[pos + 2] = left;
    vertices[pos + 3] = bottom;

    vertices[pos + 4] = x + width;
    vertices[pos + 5] = y;
    vertices[pos + 6] = right;
    vertices[pos + 7] = bottom;

    vertices[pos + 8] = x + width;
    vertices[pos + 9] = y + height;
    vertices[pos + 10] = right;
    vertices[pos + 11] = top;

    vertices[pos + 12] = x;
    vertices[pos + 13] = y + height;
    vertices[pos + 14] = left;
    vertices[pos + 15] = top;

    b->vertex_pos = pos + 16;
    render_index4(b);
}

void render_rectangle(renderbuffer *b, float x, float y, float width, float height, float red, float green, float blue) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = x;
    vertices[pos + 1] = y;
    vertices[pos + 2] = red;
    vertices[pos + 3] = green;
    vertices[pos + 4] = blue;

    vertices[pos + 5] = x + width;
    vertices[pos + 6] = y;
    vertices[pos + 7] = red;
    vertices[pos + 8] = green;
    vertices[pos + 9] = blue;

    vertices[pos + 10] = x + width;
    vertices[pos + 11] = y + height;
    vertices[pos + 12] = red;
    vertices[pos + 13] = green;
    vertices[pos + 14] = blue;

    vertices[pos + 15] = x;
    vertices[pos + 16] = y + height;
    vertices[pos + 17] = red;
    vertices[pos + 18] = green;
    vertices[pos + 19] = blue;

    b->vertex_pos = pos + 20;
    render_index4(b);
}

void render_sprite3d(renderbuffer *b, float x, float y, float z, float sine, float cosine, sprite *s) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    sine = s->half_width * sine;
    cosine = s->half_width * cosine;

    vertices[pos] = x - cosine;
    vertices[pos + 1] = y;
    vertices[pos + 2] = z + sine;
    vertices[pos + 3] = s->left;
    vertices[pos + 4] = s->bottom;

    vertices[pos + 5] = x + cosine;
    vertices[pos + 6] = y;
    vertices[pos + 7] = z - sine;
    vertices[pos + 8] = s->right;
    vertices[pos + 9] = s->bottom;

    vertices[pos + 10] = x + cosine;
    vertices[pos + 11] = y + s->height;
    vertices[pos + 12] = z - sine;
    vertices[pos + 13] = s->right;
    vertices[pos + 14] = s->top;

    vertices[pos + 15] = x - cosine;
    vertices[pos + 16] = y + s->height;
    vertices[pos + 17] = z + sine;
    vertices[pos + 18] = s->left;
    vertices[pos + 19] = s->top;

    b->vertex_pos = pos + 20;
    render_index4(b);
}

#define STRIDE 5
#define CUBE_VERTEX_COUNT 24 * STRIDE

#define RENDER_CUBE(x, y, z)                                                                                                                                                                           \
    {                                                                                                                                                                                                  \
        x, -y, -z, 0, 0,      /* pos x 0 */                                                                                                                                                            \
            x, y, -z, 1, 0,   /* pos x 1 */                                                                                                                                                            \
            x, y, z, 1, 1,    /* pos x 2 */                                                                                                                                                            \
            x, -y, z, 0, 1,   /* pos x 3 */                                                                                                                                                            \
            -x, -y, -z, 0, 0, /* neg x 0 */                                                                                                                                                            \
            -x, -y, z, 0, 1,  /* neg x 1 */                                                                                                                                                            \
            -x, y, z, 1, 1,   /* neg x 2 */                                                                                                                                                            \
            -x, y, -z, 1, 0,  /* neg x 3 */                                                                                                                                                            \
            -x, y, -z, 0, 0,  /* pos y 0 */                                                                                                                                                            \
            -x, y, z, 0, 1,   /* pos y 1 */                                                                                                                                                            \
            x, y, z, 1, 1,    /* pos y 2 */                                                                                                                                                            \
            x, y, -z, 1, 0,   /* pos y 3 */                                                                                                                                                            \
            -x, -y, -z, 0, 0, /* neg y 0 */                                                                                                                                                            \
            x, -y, -z, 1, 0,  /* neg y 1 */                                                                                                                                                            \
            x, -y, z, 1, 1,   /* neg y 2 */                                                                                                                                                            \
            -x, -y, z, 0, 1,  /* neg y 3 */                                                                                                                                                            \
            x, -y, z, 1, 0,   /* pos z 0 */                                                                                                                                                            \
            x, y, z, 1, 1,    /* pos z 1 */                                                                                                                                                            \
            -x, y, z, 0, 1,   /* pos z 2 */                                                                                                                                                            \
            -x, -y, z, 0, 0,  /* pos z 3 */                                                                                                                                                            \
            -x, -y, -z, 0, 0, /* neg z 0 */                                                                                                                                                            \
            -x, y, -z, 0, 1,  /* neg z 1 */                                                                                                                                                            \
            x, y, -z, 1, 1,   /* neg z 2 */                                                                                                                                                            \
            x, -y, -z, 1, 0   /* neg z 3 */                                                                                                                                                            \
    }

static void translate_vectors(float *vertices, unsigned int count, float x, float y, float z) {
    for (unsigned int i = 0; i < count; i += STRIDE) {
        vertices[i] += x;
        vertices[i + 1] += y;
        vertices[i + 2] += z;
    }
}

// static void rotate_vectors_x(float *vertices, unsigned int count, float sine, float cosine) {
//     for (unsigned int i = 0; i < count; i += STRIDE) {
//         float y = vertices[i + 1] * cosine - vertices[i + 2] * sine;
//         float z = vertices[i + 1] * sine + vertices[i + 2] * cosine;
//         vertices[i + 1] = y;
//         vertices[i + 2] = z;
//     }
// }

static void rotate_vectors_y(float *vertices, unsigned int count, float sine, float cosine) {
    for (unsigned int i = 0; i < count; i += STRIDE) {
        float x = vertices[i] * cosine + vertices[i + 2] * sine;
        float z = vertices[i + 2] * cosine - vertices[i] * sine;
        vertices[i] = x;
        vertices[i + 2] = z;
    }
}

void render_model(renderbuffer *b, float x, float y, float z, float angle) {
    float cube[CUBE_VERTEX_COUNT] = RENDER_CUBE(1, 1, 1);

    rotate_vectors_y(cube, CUBE_VERTEX_COUNT, sinf(angle), cosf(angle));
    translate_vectors(cube, CUBE_VERTEX_COUNT, x, y, z);

    memcpy(b->vertices, cube, CUBE_VERTEX_COUNT * sizeof(float));
    b->vertex_pos += CUBE_VERTEX_COUNT;

    for (int i = 0; i < 6; i++)
        render_index4(b);
}
