#ifndef STATE_H
#define STATE_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_base.h"
#include "vulkan/vulkan_base_util.h"
#include "vulkan/vulkan_pipe_data.h"
#include "vulkan/vulkan_pipeline.h"
#include "vulkan/vulkan_pipeline_util.h"
#include "vulkan/vulkan_render_buffer.h"
#include "vulkan/vulkan_state.h"
#include "vulkan/vulkan_uniform_util.h"

#include "assets/assets.h"
#include "common/log.h"
#include "common/mem.h"
#include "input/input.h"
#include "render/render.h"
#include "world/world.h"

#include "camera.h"
#include "hud.h"
#include "mega_wad.h"
#include "scene.h"
#include "sound_system.h"
#include "world_scene.h"

typedef struct state state;

struct state {
    input in;
    sound_system *ss;
    model_system *ms;
    world *w;
    camera *c;
    thing *h;
    SDL_Window *window;
    int canvas_width;
    int canvas_height;
    vulkan_state *vk_state;
    struct vulkan_base *vk_base;
    struct vulkan_image *images;
    struct vulkan_pipeline **pipelines;
    struct vulkan_render_buffer *draw_canvas;
    world_scene *ws;
    struct hud *hd;
    struct scene *sc;
};

void state_update(state *self);
void state_render(state *self);

state *create_state(SDL_Window *window, vulkan_state *vk_state);
void delete_state(state *self);

#endif
