#ifndef VULKAN_OFFSCREEN_BUFFER_H
#define VULKAN_OFFSCREEN_BUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/fileio.h"
#include "common/mem.h"

#include "vulkan_base.h"
#include "vulkan_state.h"

struct vulkan_frame_attachment {
    VkImage image;
    VkDeviceMemory memory;
    VkImageView view;
    VkFormat format;
};

struct vulkan_offscreen_buffer {
    uint32_t width, height;
    VkFramebuffer buffer;
    struct vulkan_frame_attachment position, normal, albedo, depth;
    VkRenderPass render_pass;
};

void create_vulkan_offscreen_buffer(vulkan_state *vk_state, struct vulkan_base *vk_base);

#endif
