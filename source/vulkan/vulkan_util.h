#ifndef VULKAN_UTIL_H
#define VULKAN_UTIL_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_state.h"

void vulkan_map_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory, size_t size, void *mapped_memory);
void vulkan_unmap_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory);
void vulkan_copy_memory(void *mapped_memory, void *data, size_t size);
size_t vuklan_calculate_dynamic_alignment(vulkan_state *vk_state, size_t cpu_size);

#endif
