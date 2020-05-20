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

#include "core/fileio.h"
#include "core/mem.h"

#include "vulkan_struct.h"
#include "vulkan_vertex.h"

struct vulkan_pipeline *vk_create_pipeline(char *vertex, char *fragment);
void vk_create_render_pass(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_create_graphics_pipeline(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_pipeline *pipeline);
void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *self);

#endif
