#ifndef VULKAN_RENDER_SETTINGS_H
#define VULKAN_RENDER_SETTINGS_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_buffer.h"
#include "vulkan_state.h"

struct vulkan_render_settings {
    int position;
    int color;
    int texture;
    int normal;
    int bone;
    uint32_t stride;
};

int vk_attribute_count(struct vulkan_render_settings *settings);
VkVertexInputBindingDescription vk_binding_description(struct vulkan_render_settings *settings);
VkVertexInputAttributeDescription *vk_attribute_description(struct vulkan_render_settings *settings);
void vulkan_render_settings_init(struct vulkan_render_settings *self, int position, int color, int texture, int normal, int bone);

#endif
