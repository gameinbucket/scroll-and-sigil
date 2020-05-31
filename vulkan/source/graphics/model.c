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

static void model_cube_init(bone *bones, int bone_index, int cube_index, wad_element *size, wad_element *pivot, wad_element *origin, wad_element *rotation, float scale) {
    bone *b = &bones[bone_index];
    float width = wad_get_float(wad_get_from_array(size, 0)) * scale;
    float height = wad_get_float(wad_get_from_array(size, 1)) * scale;
    float length = wad_get_float(wad_get_from_array(size, 2)) * scale;
    float cube[CUBE_MODEL_VERTEX_COUNT] = RENDER_CUBE_MODEL(width, height, length, bone_index);
    memcpy(&b->cubes[cube_index * CUBE_MODEL_VERTEX_COUNT], cube, CUBE_MODEL_VERTEX_BYTES);
    struct model_cube *info = &b->cube_info[cube_index];
    if (pivot != NULL) {
        float x = wad_get_float(wad_get_from_array(pivot, 0)) * scale;
        float y = wad_get_float(wad_get_from_array(pivot, 1)) * scale;
        float z = wad_get_float(wad_get_from_array(pivot, 2)) * scale;
        info->pivot[0] = x;
        info->pivot[1] = y;
        info->pivot[2] = z;
    }
    if (origin != NULL) {
        float x = wad_get_float(wad_get_from_array(origin, 0)) * scale;
        float y = wad_get_float(wad_get_from_array(origin, 1)) * scale;
        float z = wad_get_float(wad_get_from_array(origin, 2)) * scale;
        info->origin[0] = x;
        info->origin[1] = y;
        info->origin[2] = z;
    }
    if (rotation != NULL) {
        float x = wad_get_float(wad_get_from_array(rotation, 0));
        float y = wad_get_float(wad_get_from_array(rotation, 1));
        float z = wad_get_float(wad_get_from_array(rotation, 2));
        x = DEGREE_TO_RADIAN(x);
        y = DEGREE_TO_RADIAN(y);
        z = DEGREE_TO_RADIAN(z);
        euler_to_quaternion(info->rotation, -x, -y, -z);
    } else {
        quaternion_identity(info->rotation);
    }
}

// static void bone_offset(bone *b, float x, float y, float z) {
//     b->bind_pose.position[0] = -x;
//     b->bind_pose.position[1] = -y;
//     b->bind_pose.position[2] = -z;
// }

static void bone_rotation(bone *b, float x, float y, float z) {
    x = DEGREE_TO_RADIAN(x);
    y = DEGREE_TO_RADIAN(y);
    z = DEGREE_TO_RADIAN(z);
    euler_to_quaternion(b->bind_pose.rotation, -x, -y, -z);
}

static void bone_pivot(bone *b, float x, float y, float z) {
    // float *cube = b->cube;
    // for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
    //     cube[i] += x;
    //     cube[i + 1] += y;
    //     cube[i + 2] += z;
    // }

    // b->pivot[0] = x;
    // b->pivot[1] = y;
    // b->pivot[2] = z;

    // b->local.position[0] = x;
    // b->local.position[1] = y;
    // b->local.position[2] = z;

    b->bind_pose.position[0] = -x;
    b->bind_pose.position[1] = -y;
    b->bind_pose.position[2] = -z;
}

static void bone_attachements(bone *b, int count) {
    b->child = safe_malloc(count * sizeof(bone *));
    b->child_count = count;
}

static void bone_animation(animation *a, unsigned int frame, unsigned int bone_count, int index, wad_element *rotation) {
    float x = DEGREE_TO_RADIAN(wad_get_float(wad_get_from_array(rotation, 0)));
    float y = DEGREE_TO_RADIAN(wad_get_float(wad_get_from_array(rotation, 1)));
    float z = DEGREE_TO_RADIAN(wad_get_float(wad_get_from_array(rotation, 2)));
    float *pointer = &a->frames[frame * bone_count + index * 4];
    euler_to_quaternion(pointer, -x, -y, -z);
}

static void bone_init(bone *bones, int index, string *name, wad_element *pivot, wad_element *rotation, int cube_count, float scale) {
    bone *b = &bones[index];
    b->index = index;
    b->name = name;
    b->cubes = safe_malloc(cube_count * CUBE_MODEL_VERTEX_BYTES);
    b->cube_info = safe_calloc(cube_count, sizeof(struct model_cube));
    b->cube_count = cube_count;
    if (pivot != NULL) {
        float x = wad_get_float(wad_get_from_array(pivot, 0)) * scale;
        float y = wad_get_float(wad_get_from_array(pivot, 1)) * scale;
        float z = wad_get_float(wad_get_from_array(pivot, 2)) * scale;
        bone_pivot(b, x, y, z);
    }
    if (rotation != NULL) {
        float x = wad_get_float(wad_get_from_array(rotation, 0));
        float y = wad_get_float(wad_get_from_array(rotation, 1));
        float z = wad_get_float(wad_get_from_array(rotation, 2));
        bone_rotation(b, x, y, z);
    } else {
        quaternion_identity(b->bind_pose.rotation);
    }
    quaternion_identity(b->local.rotation);
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
    float *inverse_bind_pose = b->inverse_bind_pose_matrix;

    // float *cube = b->cube;
    // float pivot[3];
    // matrix_multiply_vector3(pivot, bind_pose, b->pivot);
    // for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
    //     cube[i] += pivot[0];
    //     cube[i + 1] += pivot[1];
    //     cube[i + 2] += pivot[2];
    // }

    matrix_inverse(inverse_bind_pose, bind_pose);

    for (int c = 0; c < b->cube_count; c++) {
        struct model_cube *info = &b->cube_info[c];
        float *cube = &b->cubes[c * CUBE_MODEL_VERTEX_COUNT];

        // for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
        //     float out[3];
        //     matrix_multiply_vector3(out, inverse_bind_pose, &cube[i]);
        //     cube[i] = out[0];
        //     cube[i + 1] = out[1];
        //     cube[i + 2] = out[2];
        // }

        for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
            cube[i] += info->pivot[0];
            cube[i + 1] += info->pivot[1];
            cube[i + 2] += info->pivot[2];
        }

        float matrix[16];
        rotation_and_position_to_matrix(matrix, info->rotation, info->origin);
        for (int i = 0; i < CUBE_MODEL_VERTEX_COUNT; i += CUBE_MODEL_STRIDE) {
            float out[3];
            matrix_multiply_vector3(out, matrix, &cube[i]);
            cube[i] = out[0];
            cube[i + 1] = out[1];
            cube[i + 2] = out[2];
        }
    }

    for (int i = 0; i < b->child_count; i++) {
        bone_calculate_bind_pose(b->child[i]);
    }
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

        wad_element *pivot = wad_get_from_object(data, "pivot");
        wad_element *rotation = wad_get_from_object(data, "rotation");
        wad_element *parent = wad_get_from_object(data, "parent");
        wad_element *cubes = wad_get_required_from_object(data, "cubes");

        int cube_count = wad_get_size(cubes);

        bone_init(bones, b_i, name, pivot, rotation, cube_count, scale);
        bone *b = &bones[b_i];

        for (int c_i = 0; c_i < cube_count; c_i++) {
            wad_element *cube = wad_get_from_array(cubes, c_i);
            wad_element *size = wad_get_required_from_object(cube, "size");
            wad_element *pivot = wad_get_from_object(cube, "pivot");
            wad_element *origin = wad_get_from_object(cube, "origin");
            wad_element *rotation = wad_get_from_object(cube, "rotation");
            model_cube_init(bones, b_i, c_i, size, pivot, origin, rotation, scale);
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

                bone_animation(animate, f, bone_count, index, bone_rotation);
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
