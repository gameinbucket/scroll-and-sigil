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
#include "vulkan_uniform_buffer.h"

void vulkan_uniform_buffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniform_buffer *uniformbuffer);
void vk_update_uniform_buffer(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index, struct uniform_buffer_object ubo);

#endif
