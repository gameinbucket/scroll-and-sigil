#include "vulkan_base_util.h"

static void vulkan_base_clean_swapchain(vulkan_state *vk_state, struct vulkan_base *vk_base) {

    delete_vulkan_depth(vk_state->vk_device, &vk_base->depth);

    for (uint32_t i = 0; i < vk_base->swapchain->swapchain_image_count; i++) {
        vkDestroyFramebuffer(vk_state->vk_device, vk_base->vk_framebuffers[i], NULL);
    }

    free(vk_base->vk_framebuffers);

    vkFreeCommandBuffers(vk_state->vk_device, vk_base->vk_command_pool, vk_base->swapchain->swapchain_image_count, vk_base->vk_command_buffers);

    vkDestroyRenderPass(vk_state->vk_device, vk_base->vk_render_pass, NULL);

    vulkan_swapchain_clean(vk_state, vk_base->swapchain);
}

void vulkan_base_create_command_buffers(vulkan_state *vk_state, struct vulkan_base *vk_base) {

    uint32_t size = vk_base->swapchain->swapchain_image_count;

    vk_base->vk_command_buffers = safe_calloc(size, sizeof(VkCommandBuffer));

    VkCommandBufferAllocateInfo command_buffer_alloc_info = {0};
    command_buffer_alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    command_buffer_alloc_info.commandPool = vk_base->vk_command_pool;
    command_buffer_alloc_info.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    command_buffer_alloc_info.commandBufferCount = size;

    if (vkAllocateCommandBuffers(vk_state->vk_device, &command_buffer_alloc_info, vk_base->vk_command_buffers) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Command Buffers\n");
        exit(1);
    }
}

void vulkan_base_recreate_swapchain(vulkan_state *vk_state, struct vulkan_base *vk_base, uint32_t width, uint32_t height) {

    VkResult vkres = vkDeviceWaitIdle(vk_state->vk_device);
    vk_ok(vkres);

    vulkan_base_clean_swapchain(vk_state, vk_base);

    vulkan_swapchain_initialize(vk_state, vk_base->swapchain, width, height);
    vk_create_swapchain_image_views(vk_state, vk_base->swapchain);

    vk_base->depth.width = vk_base->swapchain->swapchain_extent.width;
    vk_base->depth.height = vk_base->swapchain->swapchain_extent.height;

    vk_choose_depth_format(vk_state, &vk_base->depth);
    vk_create_depth_resources(vk_state, &vk_base->depth);

    vk_create_render_pass(vk_state, vk_base->swapchain, &vk_base->depth, &vk_base->vk_render_pass);

    vk_create_framebuffers(vk_state, vk_base);

    vulkan_base_create_command_buffers(vk_state, vk_base);
}

void vulkan_base_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, uint32_t width, uint32_t height) {

    vk_base->swapchain = create_vulkan_swapchain();

    vulkan_swapchain_initialize(vk_state, vk_base->swapchain, width, height);
    vk_create_swapchain_image_views(vk_state, vk_base->swapchain);

    vk_base->depth.width = vk_base->swapchain->swapchain_extent.width;
    vk_base->depth.height = vk_base->swapchain->swapchain_extent.height;

    vk_choose_depth_format(vk_state, &vk_base->depth);
    vk_create_depth_resources(vk_state, &vk_base->depth);

    vk_create_render_pass(vk_state, vk_base->swapchain, &vk_base->depth, &vk_base->vk_render_pass);

    vk_create_command_pool(vk_state, &vk_base->vk_command_pool);
    vk_create_framebuffers(vk_state, vk_base);
    vulkan_base_create_command_buffers(vk_state, vk_base);
    vulkan_base_create_sync_objects(vk_state, vk_base);
}

void delete_vulkan_base(vulkan_state *vk_state, struct vulkan_base *vk_base) {

    printf("delete vulkan base %p\n", (void *)vk_base);

    vulkan_base_clean_swapchain(vk_state, vk_base);

    for (int i = 0; i < VULKAN_MAX_FRAMES_IN_FLIGHT; i++) {
        vkDestroySemaphore(vk_state->vk_device, vk_base->vk_render_finished_semaphores[i], NULL);
        vkDestroySemaphore(vk_state->vk_device, vk_base->vk_image_available_semaphores[i], NULL);
        vkDestroyFence(vk_state->vk_device, vk_base->vk_flight_fences[i], NULL);
    }

    vkDestroyCommandPool(vk_state->vk_device, vk_base->vk_command_pool, NULL);

    free(vk_base->swapchain);
    free(vk_base->vk_command_buffers);
    free(vk_base->vk_flight_fences);
    free(vk_base->vk_images_in_flight);
    free(vk_base->vk_image_available_semaphores);
    free(vk_base->vk_render_finished_semaphores);

    free(vk_base);
}
