#include "model.h"

int model_bone_index_of_name(model *self, string *name) {
    int count = self->bone_count;
    for (int i = 0; i < count; i++) {
        if (string_equal(name, self->bones[i].name)) {
            return i;
        }
    }
    return -1;
}

static void bone_init(bone *bones, int index, float width, float height, float length) {
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

static void bone_offset(bone *b, float x, float y, float z) {
    matrix_translate(b->relative, x, y, z);
}

static void bone_pivot(bone *b, float x, float y, float z) {
    matrix_translate(b->bind_pose, x, y, z);
    matrix_inverse(b->inverse_bind_pose, b->bind_pose);
}

static void bone_attachements(bone *b, int count) {
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
            bone_pivot(b, x, y, z);
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
                bones[k].parent = &bones[i];
                count++;
            }
        }
        if (count == 0) {
            continue;
        }
        unsigned int c = 0;
        bone_attachements(&bones[i], count);
        for (unsigned int k = 0; k < bone_count; k++) {
            if (i == k) {
                continue;
            }
            string *parent_name = parent_names[k];
            if (parent_name == NULL) {
                continue;
            }
            if (string_equal(name, parent_name)) {
                bones[i].child[c] = &bones[k];
                c++;
            }
        }
    }

    free(parent_names);

    if (animation_wad == NULL) {
        return m;
    }

    unsigned int animation_count = wad_get_size(animation_wad);

    m->animation_count = animation_count;
    m->animations = safe_calloc(animation_count, sizeof(animation));

    // unsigned int i = 0;
    table_iterator animation_iter = wad_object_iterator(animation_wad);
    while (table_iterator_has_next(&animation_iter)) {
        table_pair pair = table_iterator_next(&animation_iter);

        string *animation_name = string_copy((string *)pair.key);
        wad_element *frame_data = (wad_element *)pair.value;
        printf("animate: %s\n", animation_name);

        unsigned int frame_count = wad_get_size(frame_data);
        for (unsigned int f = 0; f < frame_count; f++) {

            table_iterator frame_iter = wad_object_iterator(wad_get_from_array(frame_data, f));
            while (table_iterator_has_next(&frame_iter)) {
                table_pair pair = table_iterator_next(&frame_iter);

                string *bone_name = string_copy((string *)pair.key);
                wad_element *bone_rotation = (wad_element *)pair.value;

                int index = model_bone_index_of_name(m, bone_name);
                if (index == -1) {
                    fprintf(stdout, "Bone %s does not exist in animation %s\n", bone_name, wad_to_string(frame_data));
                    exit(1);
                }

                float x = wad_get_float(wad_get_from_array(bone_rotation, 0));
                float y = wad_get_float(wad_get_from_array(bone_rotation, 1));
                float z = wad_get_float(wad_get_from_array(bone_rotation, 2));

                printf("%s | %d | %f, %f, %f\n", bone_name, index, x, y, z);
            }
        }

        // ()pair.value;

        // wad_element *size = wad_get_required_from_object(, "size");

        // m->animations[i].transforms = safe_calloc(bone_count, sizeof(float *));
        // i++;
    }

    return m;
}
