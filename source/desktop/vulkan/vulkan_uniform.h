#ifndef VULKAN_UNIFORM_H
#define VULKAN_UNIFORM_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_state.h"

struct uniform_projection {
    alignas(16) float mvp[16];
};

struct uniform_projection_and_normal {
    alignas(16) float mvp[16];
    alignas(16) float normal[16];
};

#define SMALL_BONE_LIMIT 11
#define MATRIX_4_4 16
#define UBO_BONE_ELEMENTS (SMALL_BONE_LIMIT * MATRIX_4_4)

struct uniform_bones {
    float bones[UBO_BONE_ELEMENTS];
};

struct vulkan_uniform_buffer {
    uint32_t count;
    size_t object_size;
    size_t dynamic_alignment;
    uint32_t object_instances;
    size_t buffer_size;
    VkBuffer *vk_uniform_buffers;
    VkDeviceMemory *vk_uniform_buffers_memory;
    void **mapped_memory;
};

struct vulkan_uniform_buffer *new_vulkan_uniform_buffer(size_t object_size);

#endif
