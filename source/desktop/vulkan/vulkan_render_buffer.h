#ifndef VULKAN_RENDER_BUFFER_H
#define VULKAN_RENDER_BUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_render_settings.h"
#include "vulkan_state.h"
#include "vulkan_util.h"

typedef struct vulkan_render_buffer vulkan_render_buffer;

struct vulkan_render_buffer {
    bool memory_host_visible;
    struct vulkan_render_settings settings;
    float *vertices;
    uint32_t vertex_max;
    uint32_t vertex_position;
    VkBuffer vk_vertex_buffer;
    VkDeviceMemory vk_vertex_buffer_memory;
    VkBuffer vk_vertex_staging_buffer;
    VkDeviceMemory vk_vertex_staging_buffer_memory;
    void *mapped_vertex_memory;
    uint32_t *indices;
    uint32_t index_max;
    uint32_t index_position;
    uint32_t index_offset;
    VkBuffer vk_index_buffer;
    VkDeviceMemory vk_index_buffer_memory;
    VkBuffer vk_index_staging_buffer;
    VkDeviceMemory vk_index_staging_buffer_memory;
    void *mapped_index_memory;
};

void vulkan_render_buffer_draw(vulkan_render_buffer *render, VkCommandBuffer command_buffer);
void vulkan_render_buffer_zero(vulkan_render_buffer *b);
void vulkan_render_buffer_flush(vulkan_state *vk_state, VkCommandBuffer command_buffer, struct vulkan_render_buffer *b);
void vulkan_render_buffer_immediate_flush(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *b);
vulkan_render_buffer *create_vulkan_render_buffer(vulkan_state *vk_state, struct vulkan_render_settings settings, size_t vertices, size_t indices);
void delete_vulkan_renderbuffer(vulkan_state *vk_state, vulkan_render_buffer *b);

#endif
