#include "vulkan_base.h"

struct vulkan_base *create_vulkan_base() {
    return safe_calloc(1, sizeof(struct vulkan_base));
}
