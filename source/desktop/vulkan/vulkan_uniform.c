#include "vulkan_uniform.h"

struct vulkan_uniform_buffer *new_vulkan_uniform_buffer(size_t object_size) {
    struct vulkan_uniform_buffer *ub = safe_calloc(1, sizeof(struct vulkan_uniform_buffer));
    ub->object_size = object_size;
    return ub;
}
