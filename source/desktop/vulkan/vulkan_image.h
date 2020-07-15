#ifndef VULKAN_IMAGE_H
#define VULKAN_IMAGE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan_buffer.h"
#include "vulkan_state.h"

struct vulkan_image_details {
    uint32_t width;
    uint32_t height;
    VkFormat format;
    VkImageTiling tiling;
    VkImageUsageFlags usage;
    VkMemoryPropertyFlags properties;
};

struct vulkan_image_view_and_sample {
    VkImageView view;
    VkSampler sample;
};

struct vulkan_image {
    VkImage vk_texture_image;
    VkDeviceMemory vk_texture_image_memory;
    VkImageView vk_texture_image_view;
    VkSampler vk_texture_sampler;
};

struct vulkan_image_view_and_sample get_vulkan_image_view_and_sample(struct vulkan_image *image);

void vk_create_image(vulkan_state *vk_state, struct vulkan_image_details details, VkImage *image, VkDeviceMemory *image_memory);
bool vk_has_stencil_component(VkFormat format);
VkImageView vk_create_image_view(vulkan_state *vk_state, VkImage image, VkFormat format, VkImageAspectFlags aspect_flags);
VkFormat vk_find_supported_image_format(vulkan_state *vk_state, VkFormat *candidates, int candidate_count, VkImageTiling tiling, VkFormatFeatureFlags features);
void vk_transition_image_layout(vulkan_state *vk_state, VkCommandPool command_pool, VkImage image, VkImageLayout old_layout, VkImageLayout new_layout);
void vk_copy_buffer_to_image(vulkan_state *vk_state, VkCommandPool command_pool, VkBuffer buffer, VkImage image, uint32_t width, uint32_t height);
void delete_vulkan_image(VkDevice vk_device, struct vulkan_image *image);

#endif
