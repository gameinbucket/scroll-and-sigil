#include "model.h"

void bone_recursive_join(bone *b, bone *parent) {
    if (parent != NULL) {
        b->parent = parent;
    }
    if (b->child != NULL) {
        for (int i = 0; i < b->child_count; i++) {
            bone_recursive_join(b->child[i], b);
        }
    }
}

void bone_recursive_compute(bone *b) {
    if (b->parent == NULL) {
        b->aggregate_rx = b->local_rx;
        b->aggregate_ry = b->local_ry;

    } else {
        float sin_x = sinf(b->parent->aggregate_rx);
        float cos_x = cosf(b->parent->aggregate_rx);

        float sin_y = sinf(b->parent->aggregate_ry);
        float cos_y = cosf(b->parent->aggregate_ry);

        float x = b->bone_offset_x;
        float y = b->bone_offset_y;
        float z = b->bone_offset_z;

        float yy = y * cos_x - z * sin_x;
        z = y * sin_x + z * cos_x;
        y = yy;

        float xx = x * cos_y + z * sin_y;
        z = z * cos_y - x * sin_y;
        x = xx;

        b->world_x = x + b->parent->world_x;
        b->world_y = y + b->parent->world_y;
        b->world_z = z + b->parent->world_z;

        b->aggregate_rx = b->local_rx + b->parent->aggregate_rx;
        b->aggregate_ry = b->local_ry + b->parent->aggregate_ry;
    }

    b->sin_x = sinf(b->aggregate_rx);
    b->cos_x = cosf(b->aggregate_rx);

    b->sin_y = sinf(b->aggregate_ry);
    b->cos_y = cosf(b->aggregate_ry);

    if (b->child != NULL) {
        for (int i = 0; i < b->child_count; i++) {
            bone_recursive_compute(b->child[i]);
        }
    }
}

void bone_init(bone *b, float width, float height, float length, float scale) {
    b->width = width * scale;
    b->height = height * scale;
    b->length = length * scale;
}

void bone_offset(bone *b, float x, float y, float z) {
    b->bone_offset_x = x;
    b->bone_offset_y = y;
    b->bone_offset_z = z;
}

void bone_plane_offset(bone *b, float x, float y, float z) {
    b->plane_offset_x = x;
    b->plane_offset_y = y;
    b->plane_offset_z = z;
}

void bone_attached(bone *b, int count) {
    b->child = safe_malloc(count * sizeof(bone *));
    b->child_count = count;
}
