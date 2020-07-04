#ifndef VULKAN_DESCRIPTORS_H
#define VULKAN_DESCRIPTORS_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"
#include "data/array.h"
#include "math/matrix.h"

#include "vulkan_base.h"
#include "vulkan_buffer.h"
#include "vulkan_pipe_data.h"
#include "vulkan_pipeline.h"

void vulkan_pipeline_create_descriptor_layouts(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vulkan_pipeline_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vulkan_pipeline_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);
void vulkan_pipeline_update_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
