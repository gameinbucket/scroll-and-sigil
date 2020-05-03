#ifndef VULKAN_VERTEX_H
#define VULKAN_VERTEX_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "mem.h"
#include "vulkan_buffer.h"
#include "vulkan_struct.h"

int vk_attribute_count(int position, int color, int texture, int normal);
VkVertexInputBindingDescription vk_binding_description(int position, int color, int texture, int normal);
VkVertexInputAttributeDescription *vk_attribute_description(int position, int color, int texture, int normal);
void vk_create_vertex_buffer(vulkan_state *vk_state);
void vk_create_index_buffer(vulkan_state *vk_state);

#endif
