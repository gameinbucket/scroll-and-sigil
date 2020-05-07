#ifndef VULKAN_UNIFORMS_H
#define VULKAN_UNIFORMS_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "matrix.h"
#include "mem.h"
#include "vulkan_buffer.h"
#include "vulkan_struct.h"

void vk_create_descriptor_set_layout(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_create_uniform_buffers(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_update_uniform_buffer(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, uint32_t current_image, struct uniform_buffer_object ubo);
void vk_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);

#endif
