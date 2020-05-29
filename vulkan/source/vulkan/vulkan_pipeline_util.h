#ifndef VULKAN_PIPELINE_UTIL_H
#define VULKAN_PIPELINE_UTIL_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan_framebuffer.h"
#include "vulkan_pipeline.h"
#include "vulkan_renderbuffer.h"
#include "vulkan_semaphore.h"
#include "vulkan_state.h"
#include "vulkan_uniformbuffer.h"
#include "vulkan_uniforms.h"

void vulkan_pipeline_create_command_buffers(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vulkan_pipeline_recreate_swapchain(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t width, uint32_t height);
void initialize_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t width, uint32_t height);
void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
