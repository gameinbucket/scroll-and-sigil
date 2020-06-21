#ifndef VULKAN_UNIFORM_UTIL_H
#define VULKAN_UNIFORM_UTIL_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"
#include "math/matrix.h"

#include "vulkan_base.h"
#include "vulkan_buffer.h"
#include "vulkan_uniform.h"

void vulkan_uniform_buffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniform_buffer *uniform_buffer);
void vulkan_uniform_mem_copy(vulkan_state *vk_state, VkDeviceMemory vk_uniform_buffers_memory, void *uniforms, size_t size);

#endif
