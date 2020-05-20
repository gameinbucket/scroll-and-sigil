#include "render.h"

void render_index4(struct vulkan_renderbuffer *self) {
    uint32_t pos = self->index_position;
    uint32_t offset = self->index_offset;
    uint32_t *indices = self->indices;
    indices[pos] = offset;
    indices[pos + 1] = offset + 1;
    indices[pos + 2] = offset + 2;
    indices[pos + 3] = offset + 2;
    indices[pos + 4] = offset + 3;
    indices[pos + 5] = offset;
    self->index_position = pos + 6;
    self->index_offset = offset + 4;
}

void render_cube(struct vulkan_renderbuffer *self) {
    float cube[CUBE_VERTEX_FLOAT] = RENDER_CUBE(1, 1, 1);
    memcpy(self->vertices + self->vertex_position, cube, CUBE_VERTEX_FLOAT * sizeof(float));
    for (int k = 0; k < 6; k++) {
        render_index4(self);
    }
}
