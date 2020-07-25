#ifndef TEXTURE_3D_SHADER_H
#define TEXTURE_3D_SHADER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_base.h"
#include "vulkan/vulkan_base_util.h"
#include "vulkan/vulkan_offscreen_buffer.h"
#include "vulkan/vulkan_pipe_data.h"
#include "vulkan/vulkan_pipeline.h"
#include "vulkan/vulkan_pipeline_util.h"
#include "vulkan/vulkan_render_buffer.h"
#include "vulkan/vulkan_state.h"
#include "vulkan/vulkan_uniform_util.h"

struct texture_3d_shader {
    VkDescriptorSetLayout *descriptor_set_layouts;
    VkDescriptorPool descriptor_pool;
    VkDescriptorSet *descriptor_sets;
    struct vulkan_pipeline *pipeline;
    struct vulkan_uniform_buffer *uniforms;
};

struct texture_3d_shader *new_texture_3d_shader(vulkan_state *vk_state, vulkan_base *vk_base, struct vulkan_offscreen_buffer *offscreen);
void delete_texture_3d_shader(vulkan_state *vk_state, struct texture_3d_shader *shader);

#endif
