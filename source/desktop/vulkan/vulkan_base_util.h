#ifndef VULKAN_BASE_UTIL_H
#define VULKAN_BASE_UTIL_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"

#include "vulkan_base.h"
#include "vulkan_frame_buffer.h"
#include "vulkan_render_pass.h"
#include "vulkan_semaphore.h"
#include "vulkan_state.h"
#include "vulkan_swapchain.h"

void vulkan_base_create_command_buffers(vulkan_state *vk_state, struct vulkan_base *vk_base);

void vulkan_base_recreate_swapchain(vulkan_state *vk_state, struct vulkan_base *vk_base, uint32_t width, uint32_t height);

void vulkan_base_initialize(vulkan_state *vk_state, struct vulkan_base *base, uint32_t width, uint32_t height);

void delete_vulkan_base(vulkan_state *vk_state, struct vulkan_base *base);

#endif
