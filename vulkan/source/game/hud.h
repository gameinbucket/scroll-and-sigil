#ifndef HUD_H
#define HUD_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"
#include "vulkan/vulkan_renderbuffer.h"

struct hud {
    VkPipeline vk_pipeline;
    VkPipelineLayout vk_pipeline_layout;
    VkDescriptorSet vk_descriptor_set;
    struct vulkan_renderbuffer *renderbuffer;
};

struct hud *create_hud();

void render_hud(struct hud *self, VkCommandBuffer command_buffer);

void delete_hud(vulkan_state *vk_state, struct hud *self);

#endif
