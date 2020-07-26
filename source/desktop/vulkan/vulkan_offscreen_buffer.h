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
    uint32_t attachment_count;
    VkFormat *attachment_formats;
    struct vulkan_frame_attachment *attachments;
    bool include_depth;
    struct vulkan_frame_attachment depth_attachment;
    VkDescriptorSetLayout descriptor_set_layout;
    VkDescriptorPool descriptor_pool;
    VkDescriptorSet descriptor_set;
    VkRenderPass render_pass;
    VkSampler color_sampler;
    VkSemaphore semaphore;
    VkCommandBuffer *command_buffers;
};

struct vulkan_image_view_and_sample get_vulkan_offscreen_buffer_view_and_sample(vulkan_offscreen_buffer *offscreen, int index);

vulkan_offscreen_buffer *create_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, uint32_t width, uint32_t height, uint32_t attachment_count, VkFormat *attachment_formats, bool include_depth);

void vulkan_offscreen_buffer_clean(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self);
void vulkan_offscreen_buffer_recreate(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self);
void delete_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self);

VkCommandBuffer vulkan_offscreen_buffer_begin_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen, uint32_t image_index);
void vulkan_offscreen_buffer_begin_render_pass(vulkan_offscreen_buffer *offscreen, VkCommandBuffer command_buffer);
void vulkan_offscreen_buffer_end_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen, uint32_t image_index);

#endif
