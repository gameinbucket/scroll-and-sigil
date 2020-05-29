#ifndef STATE_H
#define STATE_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "render/render.h"
#include "vulkan/vulkan_pipeline.h"
#include "vulkan/vulkan_pipeline_util.h"
#include "vulkan/vulkan_renderbuffer.h"
#include "vulkan/vulkan_state.h"
#include "vulkan/vulkan_uniforms.h"

#include "log.h"
#include "renderstate.h"
#include "wad.h"

#define VK_SYNC_TIMEOUT 1000000000

#define VULKAN_RENDERERS_COUNT 2

typedef struct state state;

struct state {
    SDL_Window *window;
    int canvas_width;
    int canvas_height;
    renderstate *rs;
    vulkan_state *vk_state;
    struct vulkan_pipeline *pipelines[VULKAN_RENDERERS_COUNT];
};

state *create_state(SDL_Window *window, renderstate *rs, vulkan_state *vk_state);

void state_update(state *self);
void state_render(state *self);

void delete_state(state *self);

#endif
