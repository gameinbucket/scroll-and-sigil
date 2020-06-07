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
void vk_create_descriptors(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
