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
#include "vulkan_commands.h"
#include "vulkan_depth.h"
#include "vulkan_state.h"

typedef struct vulkan_frame_attachment vulkan_frame_attachment;

struct vulkan_frame_attachment {
    VkImage image;
    VkDeviceMemory memory;
    VkImageView view;
    VkFormat format;
};

typedef struct vulkan_offscreen_buffer vulkan_offscreen_buffer;

struct vulkan_offscreen_buffer {
    uint32_t width, height;
    VkFramebuffer buffer;
    vulkan_frame_attachment position, normal, color, depth;
    VkRenderPass render_pass;
    VkSampler color_sampler;
    VkSemaphore semaphore;
    VkCommandBuffer command_buffer;
};

vulkan_offscreen_buffer *create_vulkan_offscreen_buffer(vulkan_state *vk_state, uint32_t width, uint32_t height);
void delete_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_offscreen_buffer *self);
void vulkan_offscreen_buffer_command_buffer(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen);

#endif
