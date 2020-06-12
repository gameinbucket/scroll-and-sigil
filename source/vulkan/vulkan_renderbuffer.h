#ifndef VULKAN_RENDERBUFFER_H
#define VULKAN_RENDERBUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_state.h"

struct vulkan_renderbuffer {
    int position;
    int color;
    int texture;
    int normal;
    int bone;
    uint32_t stride;
    float *vertices;
    uint32_t vertex_max;
    uint32_t vertex_position;
    VkBuffer vk_vertex_buffer;
    VkDeviceMemory vk_vertex_buffer_memory;
    uint32_t *indices;
    uint32_t index_max;
    uint32_t index_position;
    uint32_t index_offset;
    VkBuffer vk_index_buffer;
    VkDeviceMemory vk_index_buffer_memory;
};

int vk_attribute_count(int position, int color, int texture, int normal, int bone);
VkVertexInputBindingDescription vk_binding_description(int position, int color, int texture, int normal, int bone);
VkVertexInputAttributeDescription *vk_attribute_description(int position, int color, int texture, int normal, int bone);

void vulkan_renderbuffer_update_data(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_renderbuffer *renderbuffer);

struct vulkan_renderbuffer *create_vulkan_renderbuffer(int position, int color, int texture, int normal, int bone, size_t vertices, size_t indices);
void delete_vulkan_renderbuffer(vulkan_state *vk_state, struct vulkan_renderbuffer *self);

#endif
