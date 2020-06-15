#ifndef WORLD_SCENE_H
#define WORLD_SCENE_H

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
#include "vulkan/vulkan_render_buffer.h"
#include "vulkan/vulkan_uniforms.h"

#include "assets/assets.h"
#include "common/mem.h"
#include "common/string_util.h"
#include "data/uint_table.h"
#include "math/matrix.h"
#include "render/render.h"
#include "world/world.h"

#include "camera.h"

typedef struct world_scene world_scene;

struct world_scene {
    world *w;
    camera *c;
    uint_table *sector_cache;
    struct vulkan_pipeline *pipeline;
    struct vulkan_pipeline *pipeline_model;
    struct vulkan_render_buffer *thing_buffer;
};

void world_scene_geometry(struct vulkan_state *vk_state, struct vulkan_base *vk_base, world_scene *self);
void world_scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, world_scene *self, VkCommandBuffer command_buffer, uint32_t image_index);
void world_scene_create_buffers(vulkan_state *vk_state, VkCommandPool command_pool, world_scene *self);
void world_scene_initialize(vulkan_state *vk_state, VkCommandPool command_pool, world_scene *self);
world_scene *create_world_scene(world *w);
void delete_world_scene(vulkan_state *vk_state, world_scene *self);

#endif
