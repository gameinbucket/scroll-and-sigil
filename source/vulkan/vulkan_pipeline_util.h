#ifndef VULKAN_PIPELINE_UTIL_H
#define VULKAN_PIPELINE_UTIL_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan_descriptors.h"
#include "vulkan_frame_buffer.h"
#include "vulkan_pipeline.h"
#include "vulkan_render_buffer.h"
#include "vulkan_semaphore.h"
#include "vulkan_state.h"
#include "vulkan_uniform.h"
#include "vulkan_uniform_util.h"

void vulkan_pipeline_cmd_bind(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer);
void vulkan_pipeline_cmd_bind_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t set_index, uint32_t image_index);
void vulkan_pipeline_cmd_bind_given_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t count, VkDescriptorSet *descriptors);
void vulkan_pipeline_recreate(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline);
void vulkan_pipeline_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline);
void vulkan_pipeline_static_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline);
void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
