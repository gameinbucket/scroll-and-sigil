#ifndef VULKAN_TEXTURE_H
#define VULKAN_TEXTURE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"
#include "graphics/image.h"
#include "io/fileio.h"
#include "io/image_read.h"

#include "vulkan_buffer.h"
#include "vulkan_image.h"
#include "vulkan_state.h"

image_details create_vulkan_texture(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_image *image, image_pixels *pixels, VkFilter filter, VkSamplerAddressMode mode, VkFormat format, int bytes_per_pixel);
image_details create_vulkan_png_texture(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_image *image, char *path, VkFilter filter, VkSamplerAddressMode mode);

#endif
