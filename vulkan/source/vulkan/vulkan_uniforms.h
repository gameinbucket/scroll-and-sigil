#ifndef VULKAN_UNIFORMS_H
#define VULKAN_UNIFORMS_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"
#include "math/matrix.h"

#include "vulkan_base.h"
#include "vulkan_buffer.h"
#include "vulkan_pipeline.h"
#include "vulkan_uniformbuffer.h"

void vulkan_uniformbuffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniformbuffer *uniformbuffer);
void vk_update_uniform_buffer(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t current_image, struct uniform_buffer_object ubo);
void vk_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vk_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
