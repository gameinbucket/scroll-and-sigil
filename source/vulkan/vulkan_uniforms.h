#ifndef VULKAN_UNIFORMS_H
#define VULKAN_UNIFORMS_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"
#include "math/matrix.h"

#include "vulkan_base.h"
#include "vulkan_buffer.h"
#include "vulkan_pipeline.h"
#include "vulkan_uniform_buffer.h"

void vulkan_uniform_buffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniform_buffer *uniform_buffer);
void vulkan_uniform_mem_copy(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index, void *uniforms, size_t size);

#endif
