#include "model.h"

int model_bone_index_of_name(model_info *self, string *name) {
    int count = self->bone_count;
    for (int i = 0; i < count; i++) {
        if (string_equal(name, self->bones[i].name)) {
            return i;
        }
    }
    return -1;
}

int model_animation_index_of_name(model_info *self, char *name) {
    int count = self->animation_count;
    for (int i = 0; i < count; i++) {
        if (strcmp(name, self->animations[i].name) == 0) {
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
    quaternion_identity(b->local.rotation);
}

static void bone_offset(bone *b, float x, float y, float z) {
    b->bind_pose.position[0] = -x;
    b->bind_pose.position[1] = -y;
    b->bind_pose.position[2] = -z;
}

static void bone_rotation(bone *b, float x, float y, float z) {
    x = DEGREE_TO_RADIAN(x);
    y = DEGREE_TO_RADIAN(y);
    z = DEGREE_TO_RADIAN(z);
    euler_to_quaternion(b->bind_pose.rotation, -x, -y, -z);
}

static void bone_pivot(bone *b, float x, float y, float z) {
    float *cube = b->cube;
    for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
        cube[i] += x;
        cube[i + 1] += y;
        cube[i + 2] += z;
    }

    // b->pivot[0] = x;
    // b->pivot[1] = y;
    // b->pivot[2] = z;

    // b->local.position[0] = x;
    // b->local.position[1] = y;
    // b->local.position[2] = z;
}

static void bone_animation(animation *a, unsigned int frame, unsigned int bone_count, int index, float x, float y, float z) {
    x = DEGREE_TO_RADIAN(x);
    y = DEGREE_TO_RADIAN(y);
    z = DEGREE_TO_RADIAN(z);
    float *rotation = &a->frames[frame * bone_count + index * 4];
    euler_to_quaternion(rotation, -x, -y, -z);
}

static void bone_calculate_bind_pose(bone *b) {

    bone *parent = b->parent;

    if (parent == NULL) {
        rotation_and_position_to_matrix(b->bind_pose_matrix, b->bind_pose.rotation, b->bind_pose.position);
    } else {

        float bind[16];
        rotation_and_position_to_matrix(bind, b->bind_pose.rotation, b->bind_pose.position);
        matrix_multiply(b->bind_pose_matrix, b->parent->bind_pose_matrix, bind);
    }

    float *bind_pose = b->bind_pose_matrix;

    // float *cube = b->cube;
    // for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
    //     float out[3];
    //     matrix_multiply_vector3(out, bind_pose, &cube[i]);
    //     memcpy(&cube[i], out, 3 * sizeof(float));
    // }

    // float *cube = b->cube;
    // float pivot[3];
    // matrix_multiply_vector3(pivot, bind_pose, b->pivot);
    // for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
    //     cube[i] += pivot[0];
    //     cube[i + 1] += pivot[1];
    //     cube[i + 2] += pivot[2];
    // }

    matrix_inverse(b->inverse_bind_pose_matrix, bind_pose);

    for (int i = 0; i < b->child_count; i++) {
        bone_calculate_bind_pose(b->child[i]);
    }
}

static void bone_attachements(bone *b, int count) {
    b->child = safe_malloc(count * sizeof(bone *));
    b->child_count = count;
}

model_info *model_parse(wad_element *model_wad, wad_element *animation_wad) {

    const float scale = 0.03f;

    wad_element *bones_table = wad_get_required_from_object(model_wad, "bones");
    unsigned int bone_count = wad_get_size(bones_table);
    string *texture = string_copy(wad_get_string(wad_get_required_from_object(model_wad, "texture")));

    bone *bones = safe_calloc(bone_count, sizeof(bone));
    string **parent_names = safe_calloc(bone_count, sizeof(string *));

    model_info *info = safe_calloc(1, sizeof(model_info));
    info->texture = texture;
    info->bones = bones;
    info->bone_count = bone_count;

    unsigned int b_i = 0;
    table_iterator bone_iter = wad_object_iterator(bones_table);
    while (table_iterator_has_next(&bone_iter)) {
        table_pair pair = table_iterator_next(&bone_iter);

        string *name = string_copy((string *)pair.key);
        wad_element *data = (wad_element *)pair.value;

        wad_element *size = wad_get_required_from_object(data, "size");
        wad_element *pivot = wad_get_from_object(data, "pivot");
        wad_element *offset = wad_get_from_object(data, "offset");
        wad_element *rotation = wad_get_from_object(data, "rotation");
        wad_element *parent = wad_get_from_object(data, "parent");

        float width = wad_get_float(wad_get_from_array(size, 0)) * scale;
        float height = wad_get_float(wad_get_from_array(size, 1)) * scale;
        float length = wad_get_float(wad_get_from_array(size, 2)) * scale;

        bone_init(bones, b_i, width, height, length);
        bone *b = &bones[b_i];
        b->name = name;

        if (pivot != NULL) {
            float x = wad_get_float(wad_get_from_array(pivot, 0)) * scale;
            float y = wad_get_float(wad_get_from_array(pivot, 1)) * scale;
            float z = wad_get_float(wad_get_from_array(pivot, 2)) * scale;
            bone_pivot(b, x, y, z);
        }

        if (offset != NULL) {
            float x = wad_get_float(wad_get_from_array(offset, 0)) * scale;
            float y = wad_get_float(wad_get_from_array(offset, 1)) * scale;
            float z = wad_get_float(wad_get_from_array(offset, 2)) * scale;
            bone_offset(b, x, y, z);
        }

        if (rotation != NULL) {
            float x = wad_get_float(wad_get_from_array(rotation, 0));
            float y = wad_get_float(wad_get_from_array(rotation, 1));
            float z = wad_get_float(wad_get_from_array(rotation, 2));
            bone_rotation(b, x, y, z);
        } else {
            quaternion_identity(b->bind_pose.rotation);
        }

        if (parent == NULL) {
            info->master = b;
        } else {
            parent_names[b_i] = wad_get_string(parent);
        }

        b_i++;
    }

    for (unsigned int i = 0; i < bone_count; i++) {
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

    bone_calculate_bind_pose(info->master);

    if (animation_wad == NULL) {
        return info;
    }

    unsigned int animation_count = wad_get_size(animation_wad);

    info->animation_count = animation_count;
    info->animations = safe_calloc(animation_count, sizeof(animation));

    unsigned int a_i = 0;
    table_iterator animation_iter = wad_object_iterator(animation_wad);
    while (table_iterator_has_next(&animation_iter)) {
        table_pair pair = table_iterator_next(&animation_iter);

        string *animation_name = string_copy((string *)pair.key);
        wad_element *frame_data = (wad_element *)pair.value;
        printf("animate: %s\n", animation_name);

        unsigned int frame_count = wad_get_size(frame_data);

        animation *animate = &info->animations[a_i];

        animate->name = animation_name;
        animate->frame_count = frame_count;
        animate->frames = safe_calloc(frame_count * bone_count * 4, sizeof(float));

        for (unsigned int f = 0; f < frame_count; f++) {

            for (unsigned int b = 0; b < bone_count; b++) {
                float *qu = &animate->frames[(f * bone_count) + (b * 4)];
                quaternion_identity(qu);
            }

            table_iterator frame_iter = wad_object_iterator(wad_get_from_array(frame_data, f));
            while (table_iterator_has_next(&frame_iter)) {
                table_pair pair = table_iterator_next(&frame_iter);

                string *bone_name = string_copy((string *)pair.key);
                wad_element *bone_rotation = (wad_element *)pair.value;

                int index = model_bone_index_of_name(info, bone_name);
                if (index == -1) {
                    fprintf(stdout, "Bone %s does not exist in animation %s\n", bone_name, wad_to_string(frame_data));
                    exit(1);
                }

                float x = wad_get_float(wad_get_from_array(bone_rotation, 0));
                float y = wad_get_float(wad_get_from_array(bone_rotation, 1));
                float z = wad_get_float(wad_get_from_array(bone_rotation, 2));

                bone_animation(animate, f, bone_count, index, x, y, z);
            }
        }

        a_i++;
    }

    return info;
}

model *create_model(model_info *info) {
    model *m = safe_calloc(1, sizeof(model));
    m->info = info;
    return m;
}
