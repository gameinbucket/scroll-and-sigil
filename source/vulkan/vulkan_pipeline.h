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
#include "vulkan_render_buffer.h"
#include "vulkan_state.h"
#include "vulkan_swapchain.h"
#include "vulkan_texture.h"
#include "vulkan_uniform_buffer.h"

struct vulkan_pipeline {
    uint32_t swapchain_image_count;
    struct vulkan_render_settings render_settings;
    struct vulkan_uniform_buffer *uniforms;
    struct vulkan_image **images;
    int image_count;
    uint32_t image_descriptors;
    char *vertex_shader_path;
    char *fragment_shader_path;
    VkDescriptorPool vk_descriptor_pool;
    VkDescriptorSetLayout vk_uniform_buffer_descriptor_set_layout;
    VkDescriptorSetLayout vk_image_descriptor_set_layout;
    VkDescriptorSet *vk_uniform_buffer_descriptor_sets;
    VkDescriptorSet *vk_image_descriptor_sets;
    VkPipeline vk_pipeline;
    VkPipelineLayout vk_pipeline_layout;
    bool include_depth;
    VkFrontFace rasterize_face;
    VkCullModeFlagBits rasterize_cull_mode;
};

struct vulkan_pipeline *create_vulkan_pipeline(char *vertex, char *fragment, struct vulkan_render_settings render_settings);
void vulkan_pipeline_images(struct vulkan_pipeline *self, struct vulkan_image **images, int image_count, uint32_t image_descriptors);
void vulkan_pipeline_settings(struct vulkan_pipeline *self, bool include_depth, VkFrontFace rasterize_face, VkCullModeFlagBits rasterize_cull_mode);
void vk_create_graphics_pipeline(vulkan_state *vk_state, VkExtent2D vk_extent, VkRenderPass vk_render_pass, struct vulkan_pipeline *pipeline);

#endif
