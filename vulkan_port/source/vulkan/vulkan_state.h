#ifndef VULKAN_STATE_H
#define VULKAN_STATE_H

#include <stdalign.h>
#include <stdbool.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

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
    int current_frame;
    bool framebuffer_resized;
};

void delete_vulkan_state(vulkan_state *self);

#endif
