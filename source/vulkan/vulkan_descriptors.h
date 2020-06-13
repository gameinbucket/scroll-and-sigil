#ifndef VULKAN_DESCRIPTORS_H
#define VULKAN_DESCRIPTORS_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"
#include "math/matrix.h"

#include "vulkan_base.h"
#include "vulkan_buffer.h"
#include "vulkan_pipeline.h"

void vk_create_descriptor_set_layout(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_update_descriptor_set(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index);
void vk_update_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
