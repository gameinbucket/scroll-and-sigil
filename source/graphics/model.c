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

void bone_init(bone *bones, int index, float width, float height, float length) {
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

    const float scale = 0.03f;

    wad_element *bones_table = wad_get_required_from_object(model_wad, "bones");
    unsigned int bone_count = wad_get_size(bones_table);
    string *texture = string_copy(wad_get_string(wad_get_required_from_object(model_wad, "texture")));

    bone *bones = safe_calloc(bone_count, sizeof(bone));
    string **parent_names = safe_calloc(bone_count, sizeof(string *));

    model *m = safe_calloc(1, sizeof(model));
    m->texture = texture;
    m->bones = bones;
    m->bone_count = bone_count;

    unsigned int i = 0;
    table_iterator bone_iter = wad_object_iterator(bones_table);
    while (table_iterator_has_next(&bone_iter)) {
        table_pair pair = table_iterator_next(&bone_iter);

        string *name = string_copy((string *)pair.key);
        wad_element *data = (wad_element *)pair.value;

        wad_element *size = wad_get_required_from_object(data, "size");
        wad_element *offset = wad_get_from_object(data, "offset");
        wad_element *pivot = wad_get_from_object(data, "pivot");
        wad_element *parent = wad_get_from_object(data, "parent");

        float width = wad_get_float(wad_get_from_array(size, 0)) * scale;
        float height = wad_get_float(wad_get_from_array(size, 1)) * scale;
        float length = wad_get_float(wad_get_from_array(size, 2)) * scale;

        bone_init(bones, i, width, height, length);
        bone *b = &bones[i];
        b->name = name;

        if (offset != NULL) {
            float x = wad_get_float(wad_get_from_array(offset, 0)) * scale;
            float y = wad_get_float(wad_get_from_array(offset, 1)) * scale;
            float z = wad_get_float(wad_get_from_array(offset, 2)) * scale;
            bone_offset(b, x, y, z);
        }

        if (pivot != NULL) {
            float x = wad_get_float(wad_get_from_array(pivot, 0)) * scale;
            float y = wad_get_float(wad_get_from_array(pivot, 1)) * scale;
            float z = wad_get_float(wad_get_from_array(pivot, 2)) * scale;
            bone_plane_offset(b, x, y, z);
        }

        if (parent != NULL) {
            parent_names[i] = wad_get_string(parent);
        } else {
            m->master = b;
        }

        i++;
    }

    for (i = 0; i < bone_count; i++) {
        string *name = bones[i].name;
        unsigned int count = 0;
        for (unsigned int k = 0; k < bone_count; k++) {
            if (i == k) {
                continue;
            }
            string *parent_name = parent_names[k];
            if (parent_name == NULL) {
                continue;
            }
            if (string_equal(name, parent_name)) {
                count++;
            }
        }
        if (count == 0) {
            continue;
        }
        unsigned int c = 0;
        bone_attached(&bones[i], count);
        for (unsigned int k = 0; k < bone_count; k++) {
            if (i == k) {
                continue;
            }
            string *parent_name = parent_names[k];
            if (parent_name == NULL) {
                continue;
            }
            if (string_equal(name, parent_name)) {
                bones[k].parent = &bones[i];
                bones[i].child[c] = &bones[k];
                c++;
            }
        }
    }

    free(parent_names);

    if (animation_wad == NULL) {
        return m;
    }

    printf("todo: model animation");

    return m;
}
