#ifndef VULKAN_DESCRIPTORS_H
#define VULKAN_DESCRIPTORS_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"
#include "math/matrix.h"

#include "vulkan_base.h"
#include "vulkan_buffer.h"
#include "vulkan_pipeline.h"

void vk_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_uniform_buffer_descriptor_set_layout(vulkan_state *vk_state, VkDescriptorSetLayout *vk_descriptor_set_layout);
void vk_create_image_descriptor_set_layout(vulkan_state *vk_state, uint32_t image_count, VkDescriptorSetLayout *vk_descriptor_set_layout);
void vk_create_uniform_buffer_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_image_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_update_uniform_buffer_descriptor_set(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index);
void vk_update_uniform_buffer_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_update_image_descriptor_set(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index, uint32_t sample_index);
void vk_update_image_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_descriptor_set_layouts(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_update_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
