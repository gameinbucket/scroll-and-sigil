#ifndef VULKAN_PIPE_DATA_H
#define VULKAN_PIPE_DATA_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_image.h"
#include "vulkan_state.h"
#include "vulkan_uniform.h"
#include "vulkan_uniform_util.h"

struct vulkan_pipe_item {
    uint32_t count;
    uint32_t byte_size;
    uint32_t object_instances;
    struct vulkan_uniform_buffer *uniforms;
    struct vulkan_image **images;
    VkDescriptorType type;
    VkShaderStageFlagBits stages;
};

struct vulkan_pipe_set {
    uint32_t number_of_items;
    uint32_t number_of_copies;
    struct vulkan_pipe_item *items;
    VkDescriptorSetLayout descriptor_layout;
    VkDescriptorSet *descriptor_sets;
};

struct vulkan_pipe_data {
    uint32_t number_of_sets;
    struct vulkan_pipe_set *sets;
    char *vertex;
    char *fragment;
    VkDescriptorPool descriptor_pool;
    bool use_render_pass;
    VkRenderPass render_pass;
    uint32_t color_blend_attachments_count;
    VkPipelineColorBlendAttachmentState *color_blend_attachments;
};

void vulkan_pipe_data_initialize_uniforms(vulkan_state *vk_state, struct vulkan_pipe_data *pipe_data);
void vulkan_pipe_data_clean(vulkan_state *vk_state, struct vulkan_pipe_data *pipe_data);
void delete_vulkan_pipe_data(vulkan_state *vk_state, struct vulkan_pipe_data *pipe_data);

#endif
