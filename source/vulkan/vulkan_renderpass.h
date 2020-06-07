#ifndef VULKAN_RENDER_PASS_H
#define VULKAN_RENDER_PASS_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"
#include "vulkan_depth.h"
#include "vulkan_swapchain.h"

void vk_create_render_pass(vulkan_state *vk_state, struct vulkan_swapchain *swapchain, struct vulkan_depth *depth, VkRenderPass *vk_render_pass);

#endif
