#ifndef VULKAN_SEMAPHORE_H
#define VULKAN_SEMAPHORE_H

#include <vulkan/vulkan.h>

#include "vulkan_base.h"
#include "vulkan_state.h"

void vulkan_base_create_sync_objects(vulkan_state *vk_state, struct vulkan_base *base);

#endif
