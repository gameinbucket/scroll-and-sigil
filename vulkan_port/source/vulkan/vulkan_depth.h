#ifndef VULKAN_DEPTH_H
#define VULKAN_DEPTH_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan_state.h"
#include "vulkan_swapchain.h"
#include "vulkan_texture.h"

struct vulkan_depth {
    VkImage vk_depth_image;
    VkDeviceMemory vk_depth_image_memory;
    VkImageView vk_depth_image_view;
    VkFormat vk_depth_format;
};

void vk_choose_depth_format(vulkan_state *vk_state, struct vulkan_depth *depth);
void vk_create_depth_resources(vulkan_state *vk_state, struct vulkan_swapchain *swapchain, struct vulkan_depth *depth);
void destroy_vulkan_depth(VkDevice vk_device, struct vulkan_depth *depth);

#endif
