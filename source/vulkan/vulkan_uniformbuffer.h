#ifndef VULKAN_UNIFORMBUFFER_H
#define VULKAN_UNIFORMBUFFER_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_state.h"

struct uniform_buffer_object {
    alignas(16) float mvp[16];
};

struct vulkan_uniformbuffer {
    uint32_t count;
    VkBuffer *vk_uniform_buffers;
    VkDeviceMemory *vk_uniform_buffers_memory;
};

void vulkan_uniformbuffer_clean(vulkan_state *vk_state, struct vulkan_uniformbuffer *uniformbuffer);

#endif
