#ifndef VULKAN_COMMANDS_H
#define VULKAN_COMMANDS_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/fileio.h"
#include "core/mem.h"

#include "vulkan_state.h"

VkCommandBuffer vk_begin_single_time_commands(vulkan_state *vk_state, VkCommandPool vk_command_pool);
void vk_end_single_time_commands(vulkan_state *vk_state, VkCommandPool vk_command_pool, VkCommandBuffer command_buffer);
void vk_create_command_pool(vulkan_state *vk_state, VkCommandPool *vk_command_pool);

#endif
