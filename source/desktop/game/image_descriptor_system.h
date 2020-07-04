#ifndef IMAGE_DESCRIPTOR_SYSTEM_H
#define IMAGE_DESCRIPTOR_SYSTEM_H

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
#include "vulkan/vulkan_state.h"
#include "vulkan/vulkan_uniform_util.h"

typedef struct image_descriptor_system image_descriptor_system;

struct image_descriptor_system {
    uint32_t image_total;
    struct vulkan_image *images;
    VkDescriptorSetLayout descriptor_layout;
    VkDescriptorPool descriptor_pool;
    VkDescriptorSet *image_descriptors;
};

image_descriptor_system *create_image_descriptor_system(vulkan_state *vk_state, uint32_t image_total, struct vulkan_image *images);
void delete_image_descriptor_system(vulkan_state *vk_state, image_descriptor_system *system);
VkDescriptorSet image_descriptor_system_get(image_descriptor_system *system, uint32_t index);

#endif
