#include "shadowmap.h"

shadowmap *alloc_shadowmap(int width, int height) {
    shadowmap *self = safe_malloc(sizeof(shadowmap));
    self->width = width;
    self->height = height;
    return self;
}

void shadow_map_view_projection(float *out, float *shadow_view, float *view, float *view_projection) {

    vec3 shadow_direction = (vec3){-shadow_view[2], -shadow_view[6], -shadow_view[10]};
    vector3_normalize(&shadow_direction);

    if (view == NULL || shadow_view == NULL) {
        printf("foobar\n");
    }

    float inverse_view_projection[16];
    matrix_inverse(inverse_view_projection, view_projection);

    // float inverse_shadow_view[16];
    // matrix_inverse(inverse_shadow_view, shadow_view);

    // float space_aligned[16];
    // matrix_multiply(space_aligned, inverse_shadow_view, inverse_view_projection);

    // vec4 corners[8];
    // matrix_frustum_corners(corners, space_aligned);

    // vec4 corners[8];
    // matrix_frustum_corners(corners, view_projection);

    vec4 corners[8];
    matrix_frustum_corners(corners, inverse_view_projection);

    vec3 center = {0, 0, 0};

    vec3 any = {0, 1, 0};
    vec3 side;
    vec3 up;
    VECTOR_3_CROSS(side, shadow_direction, any);
    VECTOR_3_CROSS(up, side, shadow_direction);

    float min_x = FLT_MAX;
    float max_x = FLT_MIN;
    float min_y = FLT_MAX;
    float max_y = FLT_MIN;
    float min_z = FLT_MAX;
    float max_z = FLT_MIN;

    for (int i = 0; i < 8; i++) {
        vec4 *corner = &corners[i];
        vec3 c = {corner->x, corner->y, corner->z};

        // float x = VECTOR_3_DOT(side, c);
        // float y = VECTOR_3_DOT(up, c);
        float z = VECTOR_3_DOT(shadow_direction, c);

        // min_x = fmin(min_x, x);
        // max_x = fmax(max_x, x);

        // min_y = fmin(min_y, y);
        // max_y = fmax(max_y, y);

        min_z = fmin(min_z, z);
        max_z = fmax(max_z, z);

        // min_z = fmin(min_z, c.z);
        // max_z = fmax(max_z, c.z);

        center.x += c.x;
        center.y += c.y;
        center.z += c.z;
    }

    VECTOR_3_DIVIDE(center, 8);

    float z_distance = max_z - min_z;
    printf("camera view: %f, %f, %f | z distance: %f, %f, %f\n", -view[2], -view[6], -view[10], z_distance, min_z, max_z);

    float x = center.x + shadow_direction.x * z_distance;
    float y = center.y + shadow_direction.y * z_distance;
    float z = center.z + shadow_direction.z * z_distance;
    // matrix_set_translation(shadow_view, -x, -y, -z);
    matrix_translate(shadow_view, -x, -y, -z);

    const bool ortho = false;

    float shadow_projection[16];

    if (ortho) {
        min_x = FLT_MAX;
        max_x = FLT_MIN;
        min_y = FLT_MAX;
        max_y = FLT_MIN;
        min_z = FLT_MAX;
        max_z = FLT_MIN;

        for (int i = 0; i < 8; i++) {
            vec4 *corner = &corners[i];
            vec4 c;
            matrix_multiply_vector4(&c, shadow_view, corner);
            // matrix_multiply_vector4(&c, inverse_view_projection, corner);

            min_x = fmin(min_x, c.x);
            max_x = fmax(max_x, c.x);

            min_y = fmin(min_y, c.y);
            max_y = fmax(max_y, c.y);

            min_z = fmin(min_z, c.z);
            max_z = fmax(max_z, c.z);
        }

        z_distance = max_z - min_z;

        matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, min_z, max_z);
        // matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, 0.001, z_distance);
        // matrix_orthographic(shadow_projection, -(max_x - min_x) * 0.5, (max_x - min_x) * 0.5, -(max_y - min_y) * 0.5, (max_y - min_y) * 0.5, -(max_z - min_z) * 0.5, (max_z - min_z) * 0.5);
        // matrix_orthographic(shadow_projection, -50, 50, -50, 50, 0.01, 100); // temporary work around
    } else {
        float fov = 60.0;
        float ratio = 1;
        matrix_perspective(shadow_projection, fov, 0.01, 200, ratio);
    }

    matrix_multiply(out, shadow_projection, shadow_view);
}
