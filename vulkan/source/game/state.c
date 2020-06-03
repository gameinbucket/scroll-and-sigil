#include "state.h"

static void record_rendering(__attribute__((unused)) state *self, __attribute__((unused)) struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline, uint32_t image_index) {

    VkCommandBuffer *command_buffers = vk_base->vk_command_buffers;

    VkClearValue clear_color = {.color = (VkClearColorValue){{0.0f, 0.0f, 0.0f, 1.0f}}};
    VkClearValue clear_depth = {.depthStencil = (VkClearDepthStencilValue){1.0f, 0}};
    VkClearValue clear_values[2] = {clear_color, clear_depth};

    VkRenderPassBeginInfo render_pass_info = {0};
    render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
    render_pass_info.renderPass = vk_base->vk_render_pass;
    render_pass_info.renderArea.offset = (VkOffset2D){0, 0};
    render_pass_info.renderArea.extent = vk_base->swapchain->swapchain_extent;
    render_pass_info.pClearValues = clear_values;
    render_pass_info.clearValueCount = 2;
    render_pass_info.framebuffer = vk_base->vk_framebuffers[image_index];

    uint32_t width = vk_base->swapchain->swapchain_extent.width;
    uint32_t height = vk_base->swapchain->swapchain_extent.height;

    VkViewport viewport = {0};
    viewport.width = width;
    viewport.height = height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;

    VkRect2D scissor = {0};
    scissor.extent = (VkExtent2D){width, height};
    scissor.offset = (VkOffset2D){0, 0};

    VkCommandBuffer command_buffer = command_buffers[image_index];

    VkCommandBufferBeginInfo command_begin_info = {0};
    command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    command_begin_info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

    if (vkBeginCommandBuffer(command_buffer, &command_begin_info) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
        exit(1);
    }

    vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

    vkCmdSetViewport(command_buffer, 0, 1, &viewport);
    vkCmdSetScissor(command_buffer, 0, 1, &scissor);

    vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline);
    VkBuffer vertex_buffers[1] = {pipeline->renderbuffer->vk_vertex_buffer};
    VkDeviceSize vertex_offsets[1] = {0};
    vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);
    vkCmdBindIndexBuffer(command_buffer, pipeline->renderbuffer->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 0, 1, &pipeline->vk_descriptor_sets[image_index], 0, NULL);
    vkCmdDrawIndexed(command_buffer, pipeline->renderbuffer->index_count, 1, 0, 0, 0);

    // render_scene(self->sc, command_buffers[i]);
    // render_hud(self->hd, command_buffers[i]);

    vkCmdEndRenderPass(command_buffer);

    if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan End Command Buffer\n");
        exit(1);
    }

    struct uniform_buffer_object ubo = {0};
    float view[16];
    float perspective[16];
    static float x = 0.0f;
    x += 0.01f;
    vec3 eye = {3 + x, 3, 5};
    vec3 center = {0, 0, 0};
    matrix_look_at(view, &eye, &center);
    matrix_translate(view, -eye.x, -eye.y, -eye.z);
    float ratio = (float)vk_base->swapchain->swapchain_extent.width / (float)vk_base->swapchain->swapchain_extent.height;
    matrix_perspective(perspective, 60.0, 0.01, 100, ratio);
    matrix_multiply(ubo.mvp, perspective, view);

    vk_update_uniform_buffer(vk_state, pipeline, image_index, ubo);
}

state *create_state(SDL_Window *window, vulkan_state *vk_state) {

    state *self = safe_calloc(1, sizeof(state));
    self->window = window;
    self->vk_state = vk_state;

    SDL_Vulkan_GetDrawableSize(window, &self->canvas_width, &self->canvas_height);

    struct vulkan_base *vk_base = create_vulkan_base(vk_state);
    vulkan_base_initialize(vk_state, vk_base, self->canvas_width, self->canvas_height);

    self->vk_base = vk_base;

    {
        struct vulkan_renderbuffer *render3d = vk_create_renderbuffer(3, 3, 2, 0, CUBE_VERTEX_COUNT, CUBE_INDICE_COUNT);
        struct vulkan_pipeline *pipeline3d = create_vulkan_pipeline("../vulkan-shaders/spv/texture3d.vert.spv", "../vulkan-shaders/spv/texture3d.frag.spv");
        render_cube(render3d);
        pipeline3d->renderbuffer = render3d;
        vulkan_pipeline_initialize(vk_state, vk_base, pipeline3d);
        self->pipeline3d = pipeline3d;
    }

    {
        struct vulkan_renderbuffer *render2d = vk_create_renderbuffer(2, 3, 2, 0, 4, 6);
        struct vulkan_pipeline *pipeline2d = create_vulkan_pipeline("../vulkan-shaders/spv/color2d.vert.spv", "../vulkan-shaders/spv/color2d.frag.spv");
        render_rectangle(render2d, 0, 0, 32, 32, 1.0f, 0.0f, 0.0f, 1.0f);
        pipeline2d->renderbuffer = render2d;
        vulkan_pipeline_initialize(vk_state, vk_base, pipeline2d);
        self->pipeline2d = pipeline2d;
    }

    self->hd = create_hud();
    self->sc = create_scene();

    return self;
}

void state_update(__attribute__((unused)) state *self) {
}

static void render(SDL_Window *window, vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    uint32_t current_frame = vk_state->current_frame;

    VkResult vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_base->vk_flight_fences[current_frame], VK_TRUE, VK_SYNC_TIMEOUT);
    vk_ok(vkres);

    uint32_t image_index;
    vkres = vkAcquireNextImageKHR(vk_state->vk_device, vk_base->swapchain->vk_swapchain, VK_SYNC_TIMEOUT, vk_base->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vulkan_base_recreate_swapchain(vk_state, vk_base, width, height);
        vulkan_pipeline_recreate(vk_state, vk_base, pipeline);
        return;
    } else {
        vk_ok(vkres);
    }

    record_rendering(NULL, vk_state, vk_base, pipeline, image_index);

    if (vk_base->vk_images_in_flight[image_index] != VK_NULL_HANDLE) {
        vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_base->vk_images_in_flight[image_index], VK_TRUE, VK_SYNC_TIMEOUT);
        vk_ok(vkres);
    }

    vk_base->vk_images_in_flight[image_index] = vk_base->vk_flight_fences[current_frame];

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

    VkSemaphore wait_semaphores[1] = {vk_base->vk_image_available_semaphores[current_frame]};
    VkPipelineStageFlags wait_stages[1] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};

    submit_info.waitSemaphoreCount = 1;
    submit_info.pWaitSemaphores = wait_semaphores;
    submit_info.pWaitDstStageMask = wait_stages;
    submit_info.commandBufferCount = 1;
    submit_info.pCommandBuffers = &vk_base->vk_command_buffers[image_index];

    VkSemaphore signal_semaphores[1] = {vk_base->vk_render_finished_semaphores[current_frame]};

    submit_info.signalSemaphoreCount = 1;
    submit_info.pSignalSemaphores = signal_semaphores;

    vkres = vkResetFences(vk_state->vk_device, 1, &vk_base->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    vkres = vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, vk_base->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    VkSwapchainKHR swapchains[1] = {vk_base->swapchain->vk_swapchain};

    VkPresentInfoKHR present_info = {0};
    present_info.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
    present_info.waitSemaphoreCount = 1;
    present_info.pWaitSemaphores = signal_semaphores;
    present_info.swapchainCount = 1;
    present_info.pSwapchains = swapchains;
    present_info.pImageIndices = &image_index;

    vkres = vkQueuePresentKHR(vk_state->vk_present_queue, &present_info);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR || vkres == VK_SUBOPTIMAL_KHR || vk_state->framebuffer_resized) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vk_state->framebuffer_resized = false;
        vulkan_base_recreate_swapchain(vk_state, vk_base, width, height);
        vulkan_pipeline_recreate(vk_state, vk_base, pipeline);
    } else {
        vk_ok(vkres);
    }

    vk_state->current_frame = (current_frame + 1) % VULKAN_MAX_FRAMES_IN_FLIGHT;
}

void state_render(state *self) {

    LOG("draw. ");
    render(self->window, self->vk_state, self->vk_base, self->pipeline3d);
}

void delete_state(state *self) {
    printf("delete state %p\n", (void *)self);

    delete_vulkan_pipeline(self->vk_state, self->pipeline2d);
    delete_vulkan_pipeline(self->vk_state, self->pipeline3d);
    delete_vulkan_base(self->vk_state, self->vk_base);

    free(self);
}
