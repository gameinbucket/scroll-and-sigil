#ifndef VULKAN_PIPELINE_H
#define VULKAN_PIPELINE_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "file.h"
#include "mem.h"
#include "vulkan_shader.h"
#include "vulkan_struct.h"
#include "vulkan_vertex.h"

void vk_create_render_pass(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_create_graphics_pipeline(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_pipeline *pipeline);

#endif
