#ifndef VULKAN_TEXTURE_H
#define VULKAN_TEXTURE_H

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
#include "vulkan_image.h"
#include "vulkan_state.h"

void vk_create_texture_image(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_image *image, char *path);
void vk_create_texture_image_view(vulkan_state *vk_state, struct vulkan_image *image);
void vk_create_texture_image_sampler(vulkan_state *vk_state, struct vulkan_image *image);

#endif
