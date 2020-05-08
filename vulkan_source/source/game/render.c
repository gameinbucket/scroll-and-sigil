#include "render.h"

void render_index4(uint32_t *position_pointer, uint32_t *offset_pointer, uint32_t *indices) {
    uint32_t pos = *position_pointer;
    uint32_t offset = *offset_pointer;
    indices[pos] = offset;
    indices[pos + 1] = offset + 1;
    indices[pos + 2] = offset + 2;
    indices[pos + 3] = offset + 2;
    indices[pos + 4] = offset + 3;
    indices[pos + 5] = offset;
    *position_pointer = pos + 6;
    *offset_pointer = offset + 4;
}
