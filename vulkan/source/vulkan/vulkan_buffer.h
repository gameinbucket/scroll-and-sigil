#ifndef VULKAN_BUFFER_H
#define VULKAN_BUFFER_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_commands.h"
#include "vulkan_state.h"

uint32_t vk_memory_type(vulkan_state *vk_state, uint32_t filter, VkMemoryPropertyFlags properties);
void vk_create_buffer(vulkan_state *vk_state, VkDeviceSize size, VkBufferUsageFlags usage, VkMemoryPropertyFlags properties, VkBuffer *buffer, VkDeviceMemory *buffer_memory);
void vk_copy_buffer(vulkan_state *vk_state, VkCommandPool command_pool, VkBuffer source, VkBuffer destination, VkDeviceSize size);

#endif
