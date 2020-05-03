#include "vulkan_commands.h"

void vk_create_command_pool(vulkan_state *vk_state) {

    VkCommandPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    pool_info.queueFamilyIndex = vk_state->graphics_family_index;

    VkCommandPool command_pool = {0};

    if (vkCreateCommandPool(vk_state->vk_device, &pool_info, NULL, &command_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Command Pool\n");
        exit(1);
    }

    vk_state->vk_command_pool = command_pool;
}

void vk_create_command_buffers(vulkan_state *vk_state) {

    uint32_t size = vk_state->swapchain_image_count;

    VkCommandBuffer *command_buffers = safe_calloc(size, sizeof(VkCommandBuffer));

    VkCommandBufferAllocateInfo command_buffer_alloc_info = {0};
    command_buffer_alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    command_buffer_alloc_info.commandPool = vk_state->vk_command_pool;
    command_buffer_alloc_info.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    command_buffer_alloc_info.commandBufferCount = size;

    if (vkAllocateCommandBuffers(vk_state->vk_device, &command_buffer_alloc_info, command_buffers) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Command Buffers\n");
        exit(1);
    }

    for (uint32_t i = 0; i < size; i++) {

        VkCommandBuffer command_buffer = command_buffers[i];

        VkCommandBufferBeginInfo command_begin_info = {0};
        command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;

        if (vkBeginCommandBuffer(command_buffer, &command_begin_info) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
            exit(1);
        }

        VkRenderPassBeginInfo render_pass_info = {0};
        render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
        render_pass_info.renderPass = vk_state->vk_render_pass;
        render_pass_info.framebuffer = vk_state->vk_framebuffers[i];
        render_pass_info.renderArea.offset = (VkOffset2D){0, 0};
        render_pass_info.renderArea.extent = vk_state->swapchain_extent;

        VkClearValue clear_color = {0};
        clear_color.color = (VkClearColorValue){{0.0f, 0.0f, 0.0f, 1.0f}};

        render_pass_info.pClearValues = &clear_color;
        render_pass_info.clearValueCount = 1;

        vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

        vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, vk_state->vk_pipeline);

        VkBuffer vertex_buffers[1] = {vk_state->vk_vertex_buffer};
        VkDeviceSize vertex_offsets[1] = {0};
        vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);

        vkCmdBindIndexBuffer(command_buffer, vk_state->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

        vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, vk_state->vk_pipeline_layout, 0, 1, &vk_state->vk_descriptor_sets[i], 0, NULL);

        vkCmdDrawIndexed(command_buffer, vk_state->index_count, 1, 0, 0, 0);

        vkCmdEndRenderPass(command_buffer);

        if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan End Command Buffer\n");
            exit(1);
        }
    }

    vk_state->vk_command_buffers = command_buffers;
}

void vk_create_semaphores(vulkan_state *vk_state) {

    VkFenceCreateInfo fence_info = {0};
    fence_info.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
    fence_info.flags = VK_FENCE_CREATE_SIGNALED_BIT;

    VkFence *flight_fences = safe_calloc(VULKAN_MAX_FRAMES_IN_FLIGHT, sizeof(VkFence));

    VkSemaphoreCreateInfo semaphore_info = {0};
    semaphore_info.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

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

    vk_state->vk_flight_fences = flight_fences;
    vk_state->vk_image_available_semaphores = image_available_semaphores;
    vk_state->vk_render_finished_semaphores = render_finished_semaphores;

    VkFence *images_in_flight = safe_calloc(vk_state->swapchain_image_count, sizeof(VkFence));

    for (uint32_t i = 0; i < vk_state->swapchain_image_count; i++) {
        images_in_flight[i] = VK_NULL_HANDLE;
    }

    vk_state->vk_images_in_flight = images_in_flight;
}
