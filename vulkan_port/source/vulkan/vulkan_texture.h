#ifndef VULKAN_TEXTURE_H
#define VULKAN_TEXTURE_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/fileio.h"
#include "core/mem.h"
#include "graphics/image.h"

#include "vulkan_buffer.h"
#include "vulkan_struct.h"

struct create_image_details {
    uint32_t width;
    uint32_t height;
    VkFormat format;
    VkImageTiling tiling;
    VkImageUsageFlags usage;
    VkMemoryPropertyFlags properties;
};

void vk_create_image(vulkan_state *vk_state, struct create_image_details details, VkImage *image, VkDeviceMemory *image_memory);

void vk_create_texture_image(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, char *path);
VkImageView vk_create_image_view(vulkan_state *vk_state, VkImage image, VkFormat format, VkImageAspectFlags aspect_flags);
void vk_create_texture_image_view(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_create_texture_image_sampler(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
bool vk_has_stencil_component(VkFormat format);
void vk_choose_depth_format(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_create_depth_resources(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);

#endif
