#include "state.h"

static void rendering_resize(state *self, int width, int height) {

    self->canvas_width = width;
    self->canvas_height = height;

    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

    vulkan_base_recreate_swapchain(vk_state, vk_base, width, height);

    vulkan_pipeline_recreate(vk_state, vk_base, self->sc->pipeline);
    vulkan_pipeline_recreate(vk_state, vk_base, self->hd->pipeline);
}

static void record_rendering(state *self, uint32_t image_index) {

    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

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

    render_scene(vk_state, vk_base, self->sc, command_buffer, image_index);
    render_hud(vk_state, vk_base, self->hd, command_buffer, image_index);

    vkCmdEndRenderPass(command_buffer);

    if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan End Command Buffer\n");
        exit(1);
    }
}

void state_update(__attribute__((unused)) state *self) {
}

static void render(struct state *self) {

    SDL_Window *window = self->window;
    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

    uint32_t current_frame = vk_state->current_frame;

    VkResult vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_base->vk_flight_fences[current_frame], VK_TRUE, VK_SYNC_TIMEOUT);
    vk_ok(vkres);

    uint32_t image_index;
    vkres = vkAcquireNextImageKHR(vk_state->vk_device, vk_base->swapchain->vk_swapchain, VK_SYNC_TIMEOUT, vk_base->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        rendering_resize(self, width, height);
        return;
    } else {
        vk_ok(vkres);
    }

    record_rendering(self, image_index);

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
        rendering_resize(self, width, height);
    } else {
        vk_ok(vkres);
    }

    vk_state->current_frame = (current_frame + 1) % VULKAN_MAX_FRAMES_IN_FLIGHT;
}

void state_render(state *self) {

    LOG("draw. ");
    render(self);
}

state *create_state(SDL_Window *window, vulkan_state *vk_state) {

    state *self = safe_calloc(1, sizeof(state));
    self->window = window;
    self->vk_state = vk_state;

    SDL_Vulkan_GetDrawableSize(window, &self->canvas_width, &self->canvas_height);

    struct vulkan_base *vk_base = create_vulkan_base(vk_state);
    vulkan_base_initialize(vk_state, vk_base, self->canvas_width, self->canvas_height);

    self->vk_base = vk_base;

    self->images = safe_calloc(TEXTURE_COUNT, sizeof(struct vulkan_image));
    vk_create_texture_image(vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_GRASS], "textures/tiles/grass.png");

    self->pipelines = safe_calloc(SHADER_COUNT, sizeof(struct vulkan_pipeline *));

    {
        struct vulkan_renderbuffer *render = vk_create_renderbuffer(2, 4, 0, 0, 4, 6);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline("shaders/spv/color2d.vert.spv", "shaders/spv/color2d.frag.spv");
        vulkan_pipeline_settings(pipeline, false, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
        render_rectangle(render, 0, 0, 64, 64, 1.0f, 0.0f, 0.0f, 1.0f);
        pipeline->renderbuffer = render;
        vulkan_pipeline_initialize(vk_state, vk_base, pipeline);
        self->pipelines[SHADER_COLOR_2D] = pipeline;

        self->hd = create_hud(pipeline);
    }

    {
        struct vulkan_renderbuffer *render = vk_create_renderbuffer(3, 3, 2, 0, VK_CUBE_VERTEX_COUNT * 10, VK_CUBE_INDICE_COUNT * 10);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline("shaders/spv/texture3d.vert.spv", "shaders/spv/texture3d.frag.spv");
        struct vulkan_image **images = safe_calloc(1, sizeof(struct vulkan_image *));
        images[0] = &self->images[TEXTURE_GRASS];
        vulkan_pipeline_set_images(pipeline, images, 1);
        vulkan_pipeline_settings(pipeline, true, VK_FRONT_FACE_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
        render_cube(render);
        pipeline->renderbuffer = render;
        vulkan_pipeline_initialize(vk_state, vk_base, pipeline);
        self->pipelines[SHADER_TEXTURE_3D] = pipeline;

        self->sc = create_scene(pipeline);
    }

    world *w = create_world();
    worldrender *wr = create_worldrender(w);

    mega_wad_load_resources();
    worldrender_create_buffers(wr);

    mega_wad_load_map(w);

    return self;
}

void delete_state(state *self) {

    printf("delete state %p\n", (void *)self);

    delete_hud(self->hd);
    delete_scene(self->sc);

    delete_vulkan_pipeline(self->vk_state, self->pipelines[SHADER_COLOR_2D]);
    delete_vulkan_pipeline(self->vk_state, self->pipelines[SHADER_TEXTURE_3D]);

    delete_vulkan_image(self->vk_state->vk_device, &self->images[TEXTURE_GRASS]);

    delete_vulkan_base(self->vk_state, self->vk_base);

    free(self);
}
