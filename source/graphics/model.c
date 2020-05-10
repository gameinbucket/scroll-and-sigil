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

void bone_init(bone *bones, int index, float width, float height, float length, float scale) {
    width *= scale;
    height *= scale;
    length *= scale;
    bone *b = &bones[index];
    b->index = index;
    b->width = width;
    b->height = height;
    b->length = length;
    float cube[CUBE_MODEL_VERTEX_COUNT] = RENDER_CUBE_MODEL(width, height, length, index);
    memcpy(b->cube, cube, CUBE_MODEL_VERTEX_BYTES);
    matrix_identity(b->relative);
    matrix_identity(b->bind_pose);
    matrix_inverse(b->inverse_bind_pose, b->bind_pose);
}

void bone_offset(bone *b, float x, float y, float z) {
    b->bone_offset_x = x;
    b->bone_offset_y = y;
    b->bone_offset_z = z;
    matrix_translate(b->relative, x, y, z);
}

void bone_plane_offset(bone *b, float x, float y, float z) {
    b->plane_offset_x = x;
    b->plane_offset_y = y;
    b->plane_offset_z = z;
    matrix_translate(b->bind_pose, x, y, z);
    matrix_inverse(b->inverse_bind_pose, b->bind_pose);
}

void bone_attached(bone *b, int count) {
    b->child = safe_malloc(count * sizeof(bone *));
    b->child_count = count;
}

model *model_parse(wad_element *model_wad, wad_element *animation_wad) {

    wad_element *bones = wad_object_get(model_wad, "bones");

    if (bones == NULL) {
        fprintf(stderr, "Missing bones\n");
        exit(1);
    }

    if (animation_wad == NULL) {
        return NULL;
    }

    printf("todo: model animation");

    return NULL;
}
