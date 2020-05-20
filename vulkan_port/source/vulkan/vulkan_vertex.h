#ifndef VULKAN_VERTEX_H
#define VULKAN_VERTEX_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_renderbuffer.h"
#include "vulkan_struct.h"

int vk_attribute_count(int position, int color, int texture, int normal);
VkVertexInputBindingDescription vk_binding_description(int position, int color, int texture, int normal);
VkVertexInputAttributeDescription *vk_attribute_description(int position, int color, int texture, int normal);
void vk_renderbuffer_update_vertices(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_renderbuffer *vk_render_data);
void vk_renderbuffer_update_indices(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_renderbuffer *vk_render_data);
void vk_renderbuffer_update_data(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_renderbuffer *vk_render_data);

#endif
