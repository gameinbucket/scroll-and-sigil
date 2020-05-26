#include "shadowmap.h"

shadowmap *create_shadowmap(int size) {
    shadowmap *self = safe_malloc(sizeof(shadowmap));
    self->size = size;
    return self;
}

void shadow_map_view_projection(shadowmap *shadow, float *out, float *shadow_view, float *view_projection) {

    vec3 shadow_direction = (vec3){-shadow_view[2], -shadow_view[6], -shadow_view[10]};
    vector3_normalize(&shadow_direction);

    float inverse_view_projection[16];
    matrix_inverse(inverse_view_projection, view_projection);

    vec4 corners[8];
    matrix_frustum_corners(corners, inverse_view_projection);

    float min_z = FLT_MAX;
    float max_z = FLT_MIN;

    for (int i = 0; i < 8; i++) {
        float z = corners[i].z;
        min_z = fmin(min_z, z);
        max_z = fmax(max_z, z);
    }

    float z_distance = max_z - min_z;

    vec3 center = {0};
    for (int i = 0; i < 8; i++) {
        vec4 *corner = &corners[i];
        center.x += corner->x;
        center.y += corner->y;
        center.z += corner->z;
    }

    VECTOR_3_DIVIDE(center, 8);

    float x = center.x - shadow_direction.x * z_distance;
    float y = center.y - shadow_direction.y * z_distance;
    float z = center.z - shadow_direction.z * z_distance;

    float world_units_per_texel = 1.0f / shadow->size;

    x = floorf(x / world_units_per_texel) * world_units_per_texel;
    y = floorf(y / world_units_per_texel) * world_units_per_texel;
    z = floorf(z / world_units_per_texel) * world_units_per_texel;

    matrix_translate(shadow_view, -x, -y, -z);

    float shadow_projection[16];

    float min_x = FLT_MAX;
    float max_x = FLT_MIN;
    float min_y = FLT_MAX;
    float max_y = FLT_MIN;

    min_z = FLT_MAX;
    max_z = FLT_MIN;

    for (int i = 0; i < 8; i++) {
        vec4 corner;
        matrix_multiply_vector4(&corner, shadow_view, &corners[i]);

        min_x = fmin(min_x, corner.x);
        max_x = fmax(max_x, corner.x);

        min_y = fmin(min_y, corner.y);
        max_y = fmax(max_y, corner.y);

        min_z = fmin(min_z, corner.z);
        max_z = fmax(max_z, corner.z);
    }

    z_distance = max_z - min_z;

    // world_units_per_texel = fmax(max_x - min_x, max_y - min_y) / shadow->size;

    // float min[3] = {min_x, min_y, min_z};
    // float dim[3] = {max_x, max_y, max_z};
    // VECTOR_3F_SUB(dim, min);
    // float unit = vector3f_magnitude(dim);
    // float world_units_per_texel = unit / shadow->size;

    min_x = floorf(min_x / world_units_per_texel) * world_units_per_texel;
    max_x = floorf(max_x / world_units_per_texel) * world_units_per_texel;

    min_y = floorf(min_y / world_units_per_texel) * world_units_per_texel;
    max_y = floorf(max_y / world_units_per_texel) * world_units_per_texel;

    // printf("texel: %f, %f, %f\n", unit, world_units_per_texel, world_units_per_texel);

    matrix_orthographic(shadow_projection, min_x, max_x, min_y, max_y, 0.001, z_distance);

    matrix_multiply(out, shadow_projection, shadow_view);
}
