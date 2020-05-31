#ifndef SCENE_H
#define SCENE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"
#include "vulkan/vulkan_renderbuffer.h"

struct scene {
    VkPipeline vk_pipeline;
    VkPipelineLayout vk_pipeline_layout;
    VkDescriptorSet vk_descriptor_set;
    struct vulkan_renderbuffer *renderbuffer;
};

struct scene *create_scene();

void render_scene(struct scene *self, VkCommandBuffer command_buffer);

void delete_scene(vulkan_state *vk_state, struct scene *self);

#endif
