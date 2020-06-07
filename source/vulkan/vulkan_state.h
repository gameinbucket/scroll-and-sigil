#ifndef VULKAN_STATE_H
#define VULKAN_STATE_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#define MAX(x, y) (x > y ? x : y)
#define MIN(x, y) (x < y ? x : y)

#define vk_ok(code)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    \
    if (code != VK_SUCCESS) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          \
        fprintf(stderr, "Vulkan Error: Line: %d, Code: %d\n", __LINE__, code);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         \
        exit(1);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       \
    }

#define VULKAN_ENABLE_VALIDATION

#define VULKAN_VALIDATION_LAYER_COUNT 1
static const char *const VULKAN_VALIDATION_LAYERS[VULKAN_VALIDATION_LAYER_COUNT] = {"VK_LAYER_KHRONOS_validation"};

#define VULKAN_DEVICE_EXTENSION_COUNT 1
static const char *const VULKAN_DEVICE_EXTENSIONS[VULKAN_DEVICE_EXTENSION_COUNT] = {VK_KHR_SWAPCHAIN_EXTENSION_NAME};

#define VULKAN_MAX_FRAMES_IN_FLIGHT 2

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
    VkPhysicalDevice vk_physical_device;
    VkDevice vk_device;
    VkQueue vk_present_queue;
    VkQueue vk_graphics_queue;
    uint32_t present_family_index;
    uint32_t graphics_family_index;
    VkDebugUtilsMessengerEXT vk_debug_messenger;
    uint32_t current_frame;
    bool framebuffer_resized;
};

struct swapchain_support_details vk_query_swapchain_support(vulkan_state *vk_state, VkPhysicalDevice device);
void free_swapchain_support_details(struct swapchain_support_details *self);

bool vk_choose_physical_device(vulkan_state *vk_state);
void vk_create_logical_device(vulkan_state *vk_state);
void initialize_vulkan_state(vulkan_state *vk_state);
void delete_vulkan_state(vulkan_state *vk_state);

#endif
