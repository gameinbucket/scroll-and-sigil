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
#include "vulkan_state.h"

struct vulkan_pipe_item {
    uint32_t count;
    VkDescriptorType type;
    VkDescriptorSetLayoutBinding stage_flags;
};

struct vulkan_pipe_set {
    uint32_t index;
    uint32_t item_count;
    struct vulkan_pipe_item *items;
};

struct vulkan_pipe_settings {
    uint32_t set_count;
    struct vulkan_pipe_set *sets;
};

#endif
