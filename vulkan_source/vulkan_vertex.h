#ifndef VULKAN_VERTEX_H
#define VULKAN_VERTEX_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "mem.h"

int vk_attribute_count(int position, int color, int texture, int normal);
VkVertexInputBindingDescription vk_binding_description(int position, int color, int texture, int normal);
VkVertexInputAttributeDescription *vk_attribute_description(int position, int color, int texture, int normal);

#endif
