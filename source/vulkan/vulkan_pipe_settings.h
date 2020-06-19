#ifndef VULKAN_PIPE_SETTINGS_H
#define VULKAN_PIPE_SETTINGS_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_image.h"
#include "vulkan_state.h"

struct vulkan_pipe_item {
    uint32_t size;
    uint32_t count;
    VkDescriptorType type;
    VkShaderStageFlagBits stages;
    struct vulkan_image **images;
};

struct vulkan_pipe_set {
    uint32_t index;
    uint32_t item_count;
    struct vulkan_pipe_item *items;
    VkDescriptorSetLayout layout;
    VkDescriptorSet *descriptors;
};

struct vulkan_pipe_settings {
    uint32_t number_of_sets;
    struct vulkan_pipe_set *sets;
    char *vertex;
    char *fragment;
};

void delete_vulkan_pipe_settings(struct vulkan_pipe_settings *settings);

#endif
