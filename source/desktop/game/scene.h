#ifndef SCENE_H
#define SCENE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "assets/assets.h"
#include "common/log.h"
#include "common/mem.h"
#include "render/render.h"
#include "vulkan/vulkan_base.h"
#include "vulkan/vulkan_base_util.h"
#include "vulkan/vulkan_pipeline.h"
#include "vulkan/vulkan_pipeline_util.h"
#include "vulkan/vulkan_render_buffer.h"
#include "vulkan/vulkan_state.h"
#include "vulkan/vulkan_uniform_util.h"

#include "image_descriptor_system.h"

struct scene {
    struct vulkan_pipeline *pipeline;
    struct vulkan_render_buffer *render;
    image_descriptor_system *image_system;
};

struct scene *create_scene(struct vulkan_pipeline *pipeline, struct vulkan_render_buffer *render);

void scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct scene *self, VkCommandBuffer command_buffer, uint32_t image_index);

void delete_scene(struct vulkan_state *vk_state, struct scene *self);

#endif
