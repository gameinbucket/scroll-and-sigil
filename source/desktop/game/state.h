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
#include "vulkan/vulkan_offscreen_buffer.h"
#include "vulkan/vulkan_pipe_data.h"
#include "vulkan/vulkan_pipeline.h"
#include "vulkan/vulkan_pipeline_util.h"
#include "vulkan/vulkan_render_buffer.h"
#include "vulkan/vulkan_state.h"
#include "vulkan/vulkan_uniform_util.h"

#include "assets/assets.h"
#include "common/log.h"
#include "common/mem.h"
#include "graphics/image_system.h"
#include "graphics/model_system.h"
#include "input/input.h"
#include "render/render.h"
#include "world/world.h"

#include "shaders/color_2d_shader.h"
#include "shaders/render_model_shader.h"
#include "shaders/screen_shader.h"
#include "shaders/ssao_blur_shader.h"
#include "shaders/ssao_lighting_shader.h"
#include "shaders/ssao_shader.h"
#include "shaders/texture_3d_shader.h"
#include "shaders/texture_colored_3d_shader.h"

#include "camera.h"
#include "hud.h"
#include "image_descriptor_system.h"
#include "mega_wad.h"
#include "scene.h"
#include "sound_system.h"
#include "world_scene.h"

typedef struct state state;

struct state {
    input in;
    sound_system *ss;
    image_system *is;
    model_system *ms;
    world *w;
    camera *c;
    thing *h;
    SDL_Window *window;
    int canvas_width;
    int canvas_height;
    vulkan_state *vk_state;
    struct vulkan_base *vk_base;
    struct table *image_lookup;
    struct vulkan_image *images;
    struct screen_shader *screen_shader;
    struct ssao_shader *ssao_shader;
    struct ssao_blur_shader *ssao_blur_shader;
    struct ssao_lighting_shader *ssao_lighting_shader;
    struct color_2d_shader *color_2d_shader;
    struct texture_colored_3d_shader *texture_colored_3d_shader;
    struct texture_3d_shader *texture_3d_shader;
    struct render_model_shader *render_model_shader;
    struct vulkan_render_buffer *draw_canvas;
    vulkan_offscreen_buffer *geo_offscreen;
    vulkan_offscreen_buffer *ssao_offscreen;
    vulkan_offscreen_buffer *blur_offscreen;
    image_descriptor_system *image_descriptors;
    world_scene *ws;
    struct hud *hd;
    struct scene *sc;
};

void state_update(state *self);
void state_render(state *self);

state *create_state(SDL_Window *window, vulkan_state *vk_state);
void delete_state(state *self);

#endif
