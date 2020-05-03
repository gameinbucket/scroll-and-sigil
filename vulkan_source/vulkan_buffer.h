#ifndef VULKAN_BUFFER_H
#define VULKAN_BUFFER_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "mem.h"
#include "vulkan_struct.h"

void vk_create_buffer(vulkan_state *vk_state, VkDeviceSize size, VkBufferUsageFlags usage, VkMemoryPropertyFlags properties, VkBuffer *buffer, VkDeviceMemory *buffer_memory);
void vk_copy_buffer(vulkan_state *vk_state, VkBuffer source, VkBuffer destination, VkDeviceSize size);

#endif
