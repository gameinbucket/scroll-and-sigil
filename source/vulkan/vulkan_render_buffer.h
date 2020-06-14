#ifndef VULKAN_RENDER_BUFFER_H
#define VULKAN_RENDER_BUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_render_settings.h"
#include "vulkan_state.h"

struct vulkan_render_buffer {
    struct vulkan_render_settings settings;
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

void vulkan_render_buffer_draw(struct vulkan_render_buffer *render, VkCommandBuffer command_buffer);
void vulkan_render_buffer_zero(struct vulkan_render_buffer *self);
void vulkan_render_buffer_update(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *self);
void vulkan_render_buffer_initialize(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *self);
struct vulkan_render_buffer *create_vulkan_render_buffer(struct vulkan_render_settings settings, size_t vertices, size_t indices);
void delete_vulkan_renderbuffer(vulkan_state *vk_state, struct vulkan_render_buffer *self);

#endif
