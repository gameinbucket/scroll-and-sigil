#ifndef VULKAN_DESCRIPTOR_SYSTEM_H
#define VULKAN_DESCRIPTOR_SYSTEM_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "vulkan/vulkan_descriptors.h"
#include "vulkan/vulkan_image.h"
#include "vulkan/vulkan_pipeline.h"
#include "vulkan/vulkan_pipeline_util.h"
#include "vulkan/vulkan_uniform_util.h"

struct vulkan_descriptor_system {
    uint32_t swapchain_image_count;
    uint32_t image_count;
    struct vulkan_image **images;
    VkDescriptorSetLayout vk_image_descriptor_set_layout;
    VkDescriptorPool vk_descriptor_pool;
    VkDescriptorSet *vk_image_descriptor_sets;
};

#endif
