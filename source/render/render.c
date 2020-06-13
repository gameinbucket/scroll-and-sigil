#include "render.h"

void render_index3(struct vulkan_render_buffer *b) {
    uint32_t pos = b->index_position;
    uint32_t offset = b->index_offset;
    uint32_t *indices = b->indices;
    indices[pos] = offset;
    indices[pos + 1] = offset + 1;
    indices[pos + 2] = offset + 2;
    b->index_position = pos + 3;
    b->index_offset = offset + 3;
}

void render_index4(struct vulkan_render_buffer *b) {
    uint32_t pos = b->index_position;
    uint32_t offset = b->index_offset;
    uint32_t *indices = b->indices;
    indices[pos] = offset;
    indices[pos + 1] = offset + 1;
    indices[pos + 2] = offset + 2;
    indices[pos + 3] = offset + 2;
    indices[pos + 4] = offset + 3;
    indices[pos + 5] = offset;
    b->index_position = pos + 6;
    b->index_offset = offset + 4;
}

void render_screen(struct vulkan_render_buffer *b, float x, float y, float width, float height) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;
    vertices[pos] = x;
    vertices[pos + 1] = y;
    vertices[pos + 2] = x + width;
    vertices[pos + 3] = y;
    vertices[pos + 4] = x + width;
    vertices[pos + 5] = y + height;
    vertices[pos + 6] = x;
    vertices[pos + 7] = y + height;
    b->vertex_position = pos + 8;
    render_index4(b);
}

void render_rectangle(struct vulkan_render_buffer *b, float x, float y, float width, float height, float red, float green, float blue, float alpha) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;

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

    b->vertex_position = pos + 24;
    render_index4(b);
}

void render_cube(struct vulkan_render_buffer *b) {
    float cube[VK_CUBE_VERTEX_FLOAT] = RENDER_VK_CUBE(1, 1, 1);
    memcpy(b->vertices + b->vertex_position, cube, VK_CUBE_VERTEX_FLOAT * sizeof(float));
    for (int k = 0; k < 6; k++) {
        render_index4(b);
    }
}
