#ifndef VULKAN_OFFSCREEN_BUFFER_H
#define VULKAN_OFFSCREEN_BUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"
#include "io/fileio.h"

#include "vulkan_base.h"
#include "vulkan_base_util.h"
#include "vulkan_commands.h"
#include "vulkan_depth.h"
#include "vulkan_state.h"
#include "vulkan_util.h"

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
    VkCommandBuffer *command_buffers;
    VkDescriptorSet output_descriptor;
};

vulkan_offscreen_buffer *create_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, uint32_t width, uint32_t height);

void vulkan_offscreen_buffer_clean(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self);
void vulkan_offscreen_buffer_recreate(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self);
void delete_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self);

void vulkan_offscreen_buffer_begin_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen, uint32_t image_index);
void vulkan_offscreen_buffer_end_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen, uint32_t image_index);

#endif