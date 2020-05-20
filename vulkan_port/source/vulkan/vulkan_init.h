#ifndef VULKAN_INIT_H
#define VULKAN_INIT_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_commands.h"
#include "vulkan_framebuffer.h"
#include "vulkan_pipeline.h"
#include "vulkan_struct.h"
#include "vulkan_texture.h"
#include "vulkan_uniforms.h"
#include "vulkan_vertex.h"

struct swapchain_support_details {
    VkSurfaceCapabilitiesKHR capabilities;
    VkSurfaceFormatKHR *formats;
    uint32_t format_count;
    VkPresentModeKHR *present_modes;
    uint32_t present_mode_count;
};

void vk_create_instance(SDL_Window *window, vulkan_state *vk_state);
bool vk_choose_physical_device(vulkan_state *vk_state);
void vk_create_logical_device(vulkan_state *vk_state);
void vk_create_swapchain(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, uint32_t width, uint32_t height);
void vk_create_swapchain_image_views(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);
void vk_recreate_swapchain(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, uint32_t width, uint32_t height);
void vk_create_renderer(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, uint32_t width, uint32_t height);
void vk_create_state(vulkan_state *vk_state);

#endif
