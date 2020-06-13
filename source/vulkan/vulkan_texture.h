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

void create_vulkan_texture(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_image *image, char *path, VkFilter filter, VkSamplerAddressMode mode);

#endif
