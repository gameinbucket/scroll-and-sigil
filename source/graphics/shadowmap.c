#include "shadowmap.h"

shadowmap *alloc_shadowmap(int width, int height) {
    shadowmap *self = safe_malloc(sizeof(shadowmap));
    self->width = width;
    self->height = height;
    return self;
}

void shadow_map_view_projection(float *matrix, float *shadow_view, float *view, float *view_projection) {

    // the view matrix transforms vertices from world-space to eye/view/camera-space
    // the inverse view matrix transforms coordinates from eye/view/camera-space to world-space

    // the projection matrix transforms eye/view/camera-space to screen/2d-space

    // vec3 camera = {-view[12], -view[13], -view[14]};
    // printf("camera: %f, %f, %f\n", camera.x, camera.y, camera.z);

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

    vec4 corners[8];
    matrix_frustum_corners(corners, view_projection);

    vec3 center;

    for (int i = 0; i < 8; i++) {
        vec4 *c = &corners[i];

        center.x += c->x;
        center.y += c->y;
        center.z += c->z;
    }

    VECTOR_3_DIVIDE(center, 8);

    // printf("center: %f, %f, %f\n", center.x, center.y, center.z);

    vec3 any = {0, 1, 0};

    vec3 side;
    VECTOR_3_CROSS(side, shadow_direction, any);

    vec3 up;
    VECTOR_3_CROSS(up, side, shadow_direction);

    if (up.x == -999) {
        printf("foobaz\n");
    }

    float min_x = FLT_MAX;
    float max_x = FLT_MIN;
    float min_y = FLT_MAX;
    float max_y = FLT_MIN;
    float min_z = FLT_MAX;
    float max_z = FLT_MIN;

    for (int i = 0; i < 8; i++) {
        vec4 *corner = &corners[i];
        vec4 c;
        matrix_multiply_vector4(&c, shadow_view, corner);

        min_x = fmin(min_x, c.x);
        max_x = fmax(max_x, c.x);

        min_y = fmin(min_y, c.y);
        max_y = fmax(max_y, c.y);

        min_z = fmin(min_z, c.z);
        max_z = fmax(max_z, c.z);
    }

    // for (int i = 0; i < 8; i++) {
    //     vec4 *corner = &corners[i];
    //     vec3 c = {corner->x, corner->y, corner->z};

    //     min_x = fmin(min_x, VECTOR_3_DOT(side, c));
    //     max_x = fmax(max_x, VECTOR_3_DOT(side, c));

    //     min_y = fmin(min_y, VECTOR_3_DOT(up, c));
    //     max_y = fmax(max_y, VECTOR_3_DOT(up, c));

    //     min_z = fmin(min_z, VECTOR_3_DOT(shadow_direction, c));
    //     max_z = fmax(max_z, VECTOR_3_DOT(shadow_direction, c));
    // }

    // float z_distance = max_z - min_z;
    // printf("z distance: %f\n", z_distance);

    float shadow_projection[16];

    // matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, min_z, max_z);

    // matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, 0.001, z_distance);

    // matrix_orthographic(shadow_projection, -(max_x - min_x) * 0.5, (max_x - min_x) * 0.5, -(max_y - min_y) * 0.5, (max_y - min_y) * 0.5, -(max_z - min_z) * 0.5, (max_z - min_z) * 0.5);

    matrix_orthographic(shadow_projection, -50, 50, -50, 50, 0.01, 100);

    // matrix_orthographic(shadow_projection, -50, 50, -50, 50, 0.01, z_distance);

    // printf("min/max: %f, %f, %f, %f, %f, %f\n", min_x, max_x, min_y, max_y, min_z, max_z);

    // vec3 shadow_position;
    // shadow_position.x = center.x + shadow_direction.x * z_distance;
    // shadow_position.y = center.y + shadow_direction.y * z_distance;
    // shadow_position.z = center.z + shadow_direction.z * z_distance;
    // matrix_translate(shadow_view, -shadow_position.x, -shadow_position.y, -shadow_position.z);

    matrix_multiply(matrix, shadow_projection, shadow_view);

    // memcpy(matrix, shadow_projection, 16 * sizeof(float));

    // matrix_print(shadow_projection);

    // printf("%f, %f, %f\n", shadow_direction.x, shadow_direction.y, shadow_direction.z);
}
