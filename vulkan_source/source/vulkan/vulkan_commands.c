#include "vulkan_commands.h"

VkCommandBuffer vk_begin_single_time_commands(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    VkCommandBufferAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    alloc_info.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    alloc_info.commandPool = vk_renderer->vk_command_pool;
    alloc_info.commandBufferCount = 1;

    VkCommandBuffer command_buffer;

    if (vkAllocateCommandBuffers(vk_state->vk_device, &alloc_info, &command_buffer) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Command Buffers\n");
        exit(1);
    }

    VkCommandBufferBeginInfo begin_info = {0};
    begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    begin_info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

    if (vkBeginCommandBuffer(command_buffer, &begin_info) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
        exit(1);
    }

    return command_buffer;
}

void vk_end_single_time_commands(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, VkCommandBuffer command_buffer) {

    vkEndCommandBuffer(command_buffer);

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
    submit_info.commandBufferCount = 1;
    submit_info.pCommandBuffers = &command_buffer;

    vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, VK_NULL_HANDLE);
    vkQueueWaitIdle(vk_state->vk_graphics_queue);

    vkFreeCommandBuffers(vk_state->vk_device, vk_renderer->vk_command_pool, 1, &command_buffer);
}

void vk_create_command_pool(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    VkCommandPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    pool_info.queueFamilyIndex = vk_state->graphics_family_index;

    VkCommandPool command_pool = {0};

    if (vkCreateCommandPool(vk_state->vk_device, &pool_info, NULL, &command_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Command Pool\n");
        exit(1);
    }

    vk_renderer->vk_command_pool = command_pool;
}

void vk_create_command_buffers(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_pipeline *vk_pipeline) {

    uint32_t size = vk_renderer->swapchain->swapchain_image_count;

    VkCommandBuffer *command_buffers = safe_calloc(size, sizeof(VkCommandBuffer));

    VkCommandBufferAllocateInfo command_buffer_alloc_info = {0};
    command_buffer_alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    command_buffer_alloc_info.commandPool = vk_renderer->vk_command_pool;
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
        render_pass_info.renderPass = vk_renderer->vk_render_pass;
        render_pass_info.framebuffer = vk_renderer->vk_framebuffers[i];
        render_pass_info.renderArea.offset = (VkOffset2D){0, 0};
        render_pass_info.renderArea.extent = vk_renderer->swapchain->swapchain_extent;

        VkClearValue clear_color = {.color = (VkClearColorValue){{0.0f, 0.0f, 0.0f, 1.0f}}};
        VkClearValue clear_depth = {.depthStencil = (VkClearDepthStencilValue){1.0f, 0}};

        VkClearValue clear_values[2] = {clear_color, clear_depth};

        render_pass_info.pClearValues = clear_values;
        render_pass_info.clearValueCount = 2;

        vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

        vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, vk_renderer->vk_pipeline);

        VkBuffer vertex_buffers[1] = {vk_pipeline->rendering->vk_vertex_buffer};
        VkDeviceSize vertex_offsets[1] = {0};
        vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);

        vkCmdBindIndexBuffer(command_buffer, vk_pipeline->rendering->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

        vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, vk_renderer->vk_pipeline_layout, 0, 1, &vk_renderer->vk_descriptor_sets[i], 0, NULL);

        vkCmdDrawIndexed(command_buffer, vk_pipeline->rendering->index_count, 1, 0, 0, 0);

        vkCmdEndRenderPass(command_buffer);

        if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan End Command Buffer\n");
            exit(1);
        }
    }

    vk_renderer->vk_command_buffers = command_buffers;
}

void vk_create_semaphores(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

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

    vk_renderer->vk_flight_fences = flight_fences;
    vk_renderer->vk_image_available_semaphores = image_available_semaphores;
    vk_renderer->vk_render_finished_semaphores = render_finished_semaphores;

    VkFence *images_in_flight = safe_calloc(vk_renderer->swapchain->swapchain_image_count, sizeof(VkFence));

    for (uint32_t i = 0; i < vk_renderer->swapchain->swapchain_image_count; i++) {
        images_in_flight[i] = VK_NULL_HANDLE;
    }

    vk_renderer->vk_images_in_flight = images_in_flight;
}
