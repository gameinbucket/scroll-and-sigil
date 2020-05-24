#ifndef VULKAN_UNIFORMBUFFER_H
#define VULKAN_UNIFORMBUFFER_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

struct uniform_buffer_object {
    alignas(16) float mvp[16];
};

struct vulkan_uniformbuffer {
    VkBuffer *vk_uniform_buffers;
    VkDeviceMemory *vk_uniform_buffers_memory;
};

void delete_vulkan_uniform_buffer(struct vulkan_uniformbuffer *self);

#endif
