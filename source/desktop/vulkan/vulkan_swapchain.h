#ifndef VULKAN_SWAPCHAIN_H
#define VULKAN_SWAPCHAIN_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan_image.h"
#include "vulkan_state.h"

struct vulkan_swapchain {
    uint32_t swapchain_image_count;
    VkSwapchainKHR vk_swapchain;
    VkFormat swapchain_image_format;
    VkExtent2D swapchain_extent;
    VkImage *swapchain_images;
    VkImageView *swapchain_image_views;
};

struct vulkan_swapchain *create_vulkan_swapchain();
void vulkan_swapchain_clean(vulkan_state *vk_state, struct vulkan_swapchain *swapchain);
void vulkan_swapchain_initialize(vulkan_state *vk_state, struct vulkan_swapchain *swapchain, uint32_t width, uint32_t height);
void vk_create_swapchain_image_views(vulkan_state *vk_state, struct vulkan_swapchain *swapchain);

#endif
