#include "vulkan_semaphore.h"

void vulkan_base_create_sync_objects(vulkan_state *vk_state, struct vulkan_base *vk_base) {

    VkSemaphoreCreateInfo semaphore_info = {0};
    semaphore_info.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

    VkFenceCreateInfo fence_info = {0};
    fence_info.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
    fence_info.flags = VK_FENCE_CREATE_SIGNALED_BIT;

    VkFence *flight_fences = safe_calloc(VULKAN_MAX_FRAMES_IN_FLIGHT, sizeof(VkFence));
    VkSemaphore *image_available_semaphores = safe_calloc(VULKAN_MAX_FRAMES_IN_FLIGHT, sizeof(VkSemaphore));
    VkSemaphore *render_finished_semaphores = safe_calloc(VULKAN_MAX_FRAMES_IN_FLIGHT, sizeof(VkSemaphore));

    for (int i = 0; i < VULKAN_MAX_FRAMES_IN_FLIGHT; i++) {

        if (vkCreateFence(vk_state->vk_device, &fence_info, NULL, &flight_fences[i]) != VK_SUCCESS) {
            fprintf(stderr, "Error: Create Fence\n");
            exit(1);
        }

        if (vkCreateSemaphore(vk_state->vk_device, &semaphore_info, NULL, &image_available_semaphores[i]) != VK_SUCCESS) {
            fprintf(stderr, "Error: Create Semaphore\n");
            exit(1);
        }

        if (vkCreateSemaphore(vk_state->vk_device, &semaphore_info, NULL, &render_finished_semaphores[i]) != VK_SUCCESS) {
            fprintf(stderr, "Error: Create Semaphore\n");
            exit(1);
        }
    }

    vk_base->vk_flight_fences = flight_fences;
    vk_base->vk_image_available_semaphores = image_available_semaphores;
    vk_base->vk_render_finished_semaphores = render_finished_semaphores;

    VkFence *images_in_flight = safe_calloc(vk_base->swapchain->swapchain_image_count, sizeof(VkFence));

    for (uint32_t i = 0; i < vk_base->swapchain->swapchain_image_count; i++) {
        images_in_flight[i] = VK_NULL_HANDLE;
    }

    vk_base->vk_images_in_flight = images_in_flight;
}
