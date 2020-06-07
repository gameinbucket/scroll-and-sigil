#ifndef VULKAN_BASE_H
#define VULKAN_BASE_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "vulkan_depth.h"
#include "vulkan_state.h"
#include "vulkan_swapchain.h"

struct vulkan_base {
    struct vulkan_swapchain *swapchain;
    struct vulkan_depth depth;
    VkRenderPass vk_render_pass;
    VkFramebuffer *vk_framebuffers;
    VkCommandPool vk_command_pool;
    VkCommandBuffer *vk_command_buffers;
    VkFence *vk_flight_fences;
    VkFence *vk_images_in_flight;
    VkSemaphore *vk_image_available_semaphores;
    VkSemaphore *vk_render_finished_semaphores;
};

struct vulkan_base *create_vulkan_base();

#endif
