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

#include "vulkan_depth.h"
#include "vulkan_renderbuffer.h"
#include "vulkan_state.h"
#include "vulkan_swapchain.h"
#include "vulkan_texture.h"
#include "vulkan_uniformbuffer.h"

struct vulkan_pipeline {
    struct vulkan_renderbuffer *renderbuffer;
    struct vulkan_swapchain *swapchain;
    struct vulkan_uniformbuffer *uniforms;
    struct vulkan_depth depth;
    struct vulkan_image image;
    char *vertex_shader_path;
    char *fragment_shader_path;
    VkRenderPass vk_render_pass;
    VkDescriptorPool vk_descriptor_pool;
    VkDescriptorSet *vk_descriptor_sets;
    VkFramebuffer *vk_framebuffers;
    VkCommandPool vk_command_pool;
    VkCommandBuffer *vk_command_buffers;
    VkFence *vk_flight_fences;
    VkFence *vk_images_in_flight;
    VkSemaphore *vk_image_available_semaphores;
    VkSemaphore *vk_render_finished_semaphores;
    VkDescriptorSetLayout vk_descriptor_set_layout;
    VkPipeline vk_pipeline;
    VkPipelineLayout vk_pipeline_layout;
};

void vk_create_render_pass(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
struct vulkan_pipeline *create_vulkan_pipeline(char *vertex, char *fragment);
void vk_create_descriptor_set_layout(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_graphics_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, struct vulkan_swapchain *swapchain);

#endif
