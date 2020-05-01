#ifndef VULKAN_INIT_H
#define VULKAN_INIT_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "mem.h"

#define MAX(x, y) (x > y ? x : y)
#define MIN(x, y) (x < y ? x : y)

#define VULKAN_DEVICE_EXTENSION_COUNT 1
static const char *const VULKAN_DEVICE_EXTENSIONS[VULKAN_DEVICE_EXTENSION_COUNT] = {VK_KHR_SWAPCHAIN_EXTENSION_NAME};

struct swapchain_support_details {
    VkSurfaceCapabilitiesKHR capabilities;
    VkSurfaceFormatKHR *formats;
    uint32_t format_count;
    VkPresentModeKHR *present_modes;
    uint32_t present_mode_count;
};

typedef struct vulkan_state vulkan_state;

struct vulkan_state {
    VkInstance vk_instance;
    VkSurfaceKHR vk_surface;
    VkPhysicalDevice vk_physical;
    VkDevice vk_device;
    VkQueue vk_present_queue;
    VkQueue vk_graphics_queue;
    uint32_t present_family_index;
    uint32_t graphics_family_index;
    VkSwapchainKHR vk_swapchain;
    VkFormat swapchain_image_format;
    VkExtent2D swapchain_extent;
    VkImage *swapchain_images;
    VkImageView *swapchain_image_views;
    uint32_t swapchain_image_count;
    VkRenderPass vk_render_pass;
    VkPipelineLayout vk_pipeline_layout;
    VkPipeline vk_pipeline;
};

VkInstanceCreateInfo vk_info_initialize(SDL_Window *window);
bool vk_physical_device_initialize(vulkan_state *vk_state);
void vk_create_logical_device(vulkan_state *vk_state);
void vk_create_swapchain(vulkan_state *vk_state, uint32_t width, uint32_t height);
void vk_create_image_views(vulkan_state *vk_state);
void vulkan_quit(vulkan_state *self);

#endif
