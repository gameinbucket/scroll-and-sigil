#ifndef VULKAN_PIPELINE_H
#define VULKAN_PIPELINE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/fileio.h"
#include "core/mem.h"

#include "vulkan_base.h"
#include "vulkan_renderbuffer.h"
#include "vulkan_state.h"
#include "vulkan_swapchain.h"
#include "vulkan_texture.h"
#include "vulkan_uniformbuffer.h"

struct vulkan_pipeline {
    uint32_t swapchain_image_count;
    struct vulkan_renderbuffer *renderbuffer;
    struct vulkan_uniformbuffer *uniforms;
    struct vulkan_image **images;
    int image_count;
    char *vertex_shader_path;
    char *fragment_shader_path;
    VkDescriptorSetLayout vk_descriptor_set_layout;
    VkDescriptorPool vk_descriptor_pool;
    VkDescriptorSet *vk_descriptor_sets;
    VkPipeline vk_pipeline;
    VkPipelineLayout vk_pipeline_layout;
    bool include_depth;
};

struct vulkan_pipeline *create_vulkan_pipeline(char *vertex, char *fragment, struct vulkan_image **images, int image_count, bool include_depth);
void vk_create_graphics_pipeline(vulkan_state *vk_state, VkExtent2D vk_extent, VkRenderPass vk_render_pass, struct vulkan_pipeline *pipeline);

#endif
