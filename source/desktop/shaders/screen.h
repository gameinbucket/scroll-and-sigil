#ifndef SCREEN_SHADER_H
#define SCREEN_SHADER_H

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

struct screen_shader {
    struct vulkan_pipeline *pipeline;
};

struct screen_shader *new_screen_shader(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen);

#endif
