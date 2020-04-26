#include "shadowmap.h"

shadowmap *alloc_shadowmap(int width, int height) {
    shadowmap *self = safe_malloc(sizeof(shadowmap));
    self->width = width;
    self->height = height;
    return self;
}

void shadow_map_view_projection(float *matrix, vec3 shadow_direction, float shadow_rx, float shadow_ry, float *shadow_view, float *view_projection) {

    if (shadow_rx == -999 || shadow_ry == -999) {
        printf("foobar\n");
    }

    float inverse_view_projection[16];
    matrix_inverse(inverse_view_projection, view_projection);

    vec4 corners[8];
    matrix_frustum_corners(corners, inverse_view_projection);

    vec3 center;

    // float min_z = FLT_MAX;
    // float max_z = FLT_MIN;

    for (int i = 0; i < 8; i++) {
        vec4 *c = &corners[i];

        center.x += c->x;
        center.y += c->y;
        center.z += c->z;

        // min_z = fmin(min_z, c->z);
        // max_z = fmax(max_z, c->z);
    }

    center.x /= 8;
    center.y /= 8;
    center.z /= 8;

    vec3 any = {0, 1, 0};

    vec3 side;
    VECTOR_3_CROSS(side, shadow_direction, any);

    vec3 up;
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

        min_x = fmin(min_x, VECTOR_3_DOT(side, c));
        max_x = fmax(max_x, VECTOR_3_DOT(side, c));

        min_y = fmin(min_y, VECTOR_3_DOT(up, c));
        max_y = fmax(max_y, VECTOR_3_DOT(up, c));

        min_z = fmin(min_z, VECTOR_3_DOT(shadow_direction, c));
        max_z = fmax(max_z, VECTOR_3_DOT(shadow_direction, c));
    }

    float shadow_projection[16];
    matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, min_z, max_z);
    // matrix_orthographic(shadow_projection, -50, 50, -50, 50, 0.01, 100);

    printf("%f, %f, %f, %f, %f, %f\n", min_x, max_x, min_y, max_y, min_z, max_z);

    matrix_multiply(matrix, shadow_projection, shadow_view);

    // matrix_print(shadow_projection);

    // printf("%f, %f, %f\n", shadow_direction.x, shadow_direction.y, shadow_direction.z);
    // printf("%f, %f, %f\n", center.x, center.y, center.z);

    // ------------------------------------------------------------------------

    // float z_distance = max_z - min_z;

    // vec3 shadow_position;
    // shadow_position.x = center.x + shadow_direction.x * z_distance;
    // shadow_position.y = center.y + shadow_direction.y * z_distance;
    // shadow_position.z = center.z + shadow_direction.z * z_distance;

    // float shadow_view[16];
    // matrix_identity(shadow_view);
    // matrix_rotate_x(shadow_view, sinf(shadow_rx), cosf(shadow_rx));
    // matrix_rotate_y(shadow_view, sinf(shadow_ry), cosf(shadow_ry));
    // matrix_translate(shadow_view, -shadow_position.x, -shadow_position.y, -shadow_position.z);

    // float min_x = FLT_MAX;
    // float max_x = FLT_MIN;
    // float min_y = FLT_MAX;
    // float max_y = FLT_MIN;

    // min_z = FLT_MAX;
    // max_z = FLT_MIN;

    // for (int i = 0; i < 8; i++) {
    //     vec4 *corner = &corners[i];
    //     corner->w = 1.0;
    //     vec4 c;
    //     matrix_multiply_vector4(&c, shadow_view, corner);

    //     min_x = fmin(min_x, c.x);
    //     max_x = fmax(max_x, c.x);

    //     min_y = fmin(min_y, c.y);
    //     max_y = fmax(max_y, c.y);

    //     min_z = fmin(min_z, c.z);
    //     max_z = fmax(max_z, c.z);
    // }

    // z_distance = max_z - min_z;

    // float shadow_projection[16];
    // matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, 0.01, z_distance);

    // matrix_multiply(matrix, shadow_projection, shadow_view);
}
