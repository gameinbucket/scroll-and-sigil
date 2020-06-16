#ifndef VULKAN_UNIFORM_BUFFER_H
#define VULKAN_UNIFORM_BUFFER_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_state.h"

struct uniform_buffer_projection {
    alignas(16) float mvp[16];
};

struct uniform_buffer_projection_and_normal {
    alignas(16) float mvp[16];
    alignas(16) float normal[16];
};

#define SMALL_BONE_LIMIT 11
#define MATRIX_4_4 16

struct uniform_buffer_bones {
    alignas(256) float bones[SMALL_BONE_LIMIT * MATRIX_4_4];
};

struct vulkan_uniform_buffer {
    size_t size;
    uint32_t count;
    VkBuffer *vk_uniform_buffers;
    VkDeviceMemory *vk_uniform_buffers_memory;
};

void vulkan_uniform_buffer_clean(vulkan_state *vk_state, struct vulkan_uniform_buffer *uniform_buffer);

#endif
