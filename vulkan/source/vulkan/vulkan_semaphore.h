#ifndef VULKAN_SEMAPHORE_H
#define VULKAN_SEMAPHORE_H

#include <vulkan/vulkan.h>

#include "vulkan_pipeline.h"
#include "vulkan_state.h"

void vk_create_semaphores(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
