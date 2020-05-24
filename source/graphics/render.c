#include "render.h"

const char *font = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:";
#define FONT_WIDTH 6
#define FONT_HEIGHT 8
#define FONT_GRID 21
#define FONT_COLUMN (FONT_WIDTH / 128.0f)
#define FONT_ROW (FONT_HEIGHT / 128.0f)

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

void render_colored_image(renderbuffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom, float red, float green, float blue) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = x;
    vertices[pos + 1] = y;
    vertices[pos + 2] = red;
    vertices[pos + 3] = green;
    vertices[pos + 4] = blue;
    vertices[pos + 5] = left;
    vertices[pos + 6] = bottom;

    vertices[pos + 7] = x + width;
    vertices[pos + 8] = y;
    vertices[pos + 9] = red;
    vertices[pos + 10] = green;
    vertices[pos + 11] = blue;
    vertices[pos + 12] = right;
    vertices[pos + 13] = bottom;

    vertices[pos + 14] = x + width;
    vertices[pos + 15] = y + height;
    vertices[pos + 16] = red;
    vertices[pos + 17] = green;
    vertices[pos + 18] = blue;
    vertices[pos + 19] = right;
    vertices[pos + 20] = top;

    vertices[pos + 21] = x;
    vertices[pos + 22] = y + height;
    vertices[pos + 23] = red;
    vertices[pos + 24] = green;
    vertices[pos + 25] = blue;
    vertices[pos + 26] = left;
    vertices[pos + 27] = top;

    b->vertex_pos = pos + 28;
    render_index4(b);
}

void render_rectangle(renderbuffer *b, float x, float y, float width, float height, float red, float green, float blue, float alpha) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = x;
    vertices[pos + 1] = y;
    vertices[pos + 2] = red;
    vertices[pos + 3] = green;
    vertices[pos + 4] = blue;
    vertices[pos + 5] = alpha;

    vertices[pos + 6] = x + width;
    vertices[pos + 7] = y;
    vertices[pos + 8] = red;
    vertices[pos + 9] = green;
    vertices[pos + 10] = blue;
    vertices[pos + 11] = alpha;

    vertices[pos + 12] = x + width;
    vertices[pos + 13] = y + height;
    vertices[pos + 14] = red;
    vertices[pos + 15] = green;
    vertices[pos + 16] = blue;
    vertices[pos + 17] = alpha;

    vertices[pos + 18] = x;
    vertices[pos + 19] = y + height;
    vertices[pos + 20] = red;
    vertices[pos + 21] = green;
    vertices[pos + 22] = blue;
    vertices[pos + 23] = alpha;

    b->vertex_pos = pos + 24;
    render_index4(b);
}

void render_text(renderbuffer *b, int x, int y, string *text, int scale, float red, float green, float blue) {
    int width_scale = FONT_WIDTH * scale;
    int height_scale = FONT_HEIGHT * scale;
    int current_x = x;
    int current_y = y;
    size_t len = string_len(text);
    for (size_t i = 0; i < len; i++) {
        char c = text[i];
        if (c == ' ') {
            current_x += width_scale;
            continue;
        } else if (c == '\n') {
            current_x = x;
            current_y += height_scale;
            continue;
        }
        size_t index = 0;
        while (font[index]) {
            if (font[index] == c) {
                break;
            }
            index++;
        }
        float left = (float)(index % FONT_GRID) * FONT_COLUMN;
        float top = (float)(index / FONT_GRID) * FONT_ROW;
        float right = left + FONT_COLUMN;
        float bottom = top + FONT_ROW;
        render_colored_image(b, current_x, current_y, width_scale, height_scale, left, top, right, bottom, red, green, blue);
        current_x += width_scale;
    }
}

void render_sprite(renderbuffer *b, float x, float y, float z, sprite *s, float sine, float cosine) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    sine = s->half_width * sine;
    cosine = s->half_width * cosine;

    vertices[pos] = x - cosine;
    vertices[pos + 1] = y;
    vertices[pos + 2] = z + sine;
    vertices[pos + 3] = s->left;
    vertices[pos + 4] = s->bottom;
    vertices[pos + 5] = sine;
    vertices[pos + 6] = 0;
    vertices[pos + 7] = cosine;

    vertices[pos + 8] = x + cosine;
    vertices[pos + 9] = y;
    vertices[pos + 10] = z - sine;
    vertices[pos + 11] = s->right;
    vertices[pos + 12] = s->bottom;
    vertices[pos + 13] = sine;
    vertices[pos + 14] = 0;
    vertices[pos + 15] = cosine;

    vertices[pos + 16] = x + cosine;
    vertices[pos + 17] = y + s->height;
    vertices[pos + 18] = z - sine;
    vertices[pos + 19] = s->right;
    vertices[pos + 20] = s->top;
    vertices[pos + 21] = sine;
    vertices[pos + 22] = 0;
    vertices[pos + 23] = cosine;

    vertices[pos + 24] = x - cosine;
    vertices[pos + 25] = y + s->height;
    vertices[pos + 26] = z + sine;
    vertices[pos + 27] = s->left;
    vertices[pos + 28] = s->top;
    vertices[pos + 29] = sine;
    vertices[pos + 30] = 0;
    vertices[pos + 31] = cosine;

    b->vertex_pos = pos + 32;
    render_index4(b);
}

void render_aligned_sprite(renderbuffer *b, float x, float y, float z, sprite *s, float *view) {

    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    float rpu_x = view[0] * s->width + view[1] * s->height;
    float rpu_y = view[4] * s->width + view[5] * s->height;
    float rpu_z = view[8] * s->width + view[9] * s->height;

    float rmu_x = view[0] * s->width - view[1] * s->height;
    float rmu_y = view[4] * s->width - view[5] * s->height;
    float rmu_z = view[8] * s->width - view[9] * s->height;

    float normal_x = 0.0f;
    float normal_y = 0.0f;
    float normal_z = 1.0f;

    vertices[pos] = x - rmu_x;
    vertices[pos + 1] = y - rmu_y;
    vertices[pos + 2] = z - rmu_z;
    vertices[pos + 3] = s->left;
    vertices[pos + 4] = s->bottom;
    vertices[pos + 5] = normal_x;
    vertices[pos + 6] = normal_y;
    vertices[pos + 7] = normal_z;

    vertices[pos + 8] = x - rpu_x;
    vertices[pos + 9] = y - rpu_y;
    vertices[pos + 10] = z - rpu_z;
    vertices[pos + 11] = s->right;
    vertices[pos + 12] = s->bottom;
    vertices[pos + 13] = normal_x;
    vertices[pos + 14] = normal_y;
    vertices[pos + 15] = normal_z;

    vertices[pos + 16] = x + rmu_x;
    vertices[pos + 17] = y + rmu_y;
    vertices[pos + 18] = z + rmu_z;
    vertices[pos + 19] = s->right;
    vertices[pos + 20] = s->top;
    vertices[pos + 21] = normal_x;
    vertices[pos + 22] = normal_y;
    vertices[pos + 23] = normal_z;

    vertices[pos + 24] = x + rpu_x;
    vertices[pos + 25] = y + rpu_y;
    vertices[pos + 26] = z + rpu_z;
    vertices[pos + 27] = s->left;
    vertices[pos + 28] = s->top;
    vertices[pos + 29] = normal_x;
    vertices[pos + 30] = normal_y;
    vertices[pos + 31] = normal_z;

    b->vertex_pos = pos + 32;
    render_index4(b);
}

void translate_vectors(float *vertices, unsigned int count, unsigned int stride, float x, float y, float z) {
    for (unsigned int i = 0; i < count; i += stride) {
        vertices[i] += x;
        vertices[i + 1] += y;
        vertices[i + 2] += z;
    }
}

void rotate_vectors_x(float *vertices, unsigned int count, unsigned int stride, float sine, float cosine) {
    for (unsigned int i = 0; i < count; i += stride) {
        float y = vertices[i + 1] * cosine - vertices[i + 2] * sine;
        float z = vertices[i + 1] * sine + vertices[i + 2] * cosine;
        vertices[i + 1] = y;
        vertices[i + 2] = z;
    }
}

void rotate_vectors_y(float *vertices, unsigned int count, unsigned int stride, float sine, float cosine) {
    for (unsigned int i = 0; i < count; i += stride) {
        float x = vertices[i] * cosine + vertices[i + 2] * sine;
        float z = vertices[i + 2] * cosine - vertices[i] * sine;
        vertices[i] = x;
        vertices[i + 2] = z;
    }
}
