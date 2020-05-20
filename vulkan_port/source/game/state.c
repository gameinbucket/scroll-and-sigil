#include "state.h"

state *create_state(SDL_Window *window, renderstate *rs, vulkan_state *vk_state) {

    state *self = safe_calloc(1, sizeof(state));
    self->window = window;
    self->rs = rs;
    self->vk_state = vk_state;

    SDL_Vulkan_GetDrawableSize(window, &self->canvas_width, &self->canvas_height);

    {
        struct vulkan_renderbuffer *render3d = vk_create_renderbuffer(3, 3, 2, 0, CUBE_VERTEX_COUNT, CUBE_INDICE_COUNT);
        struct vulkan_pipeline *pipeline3d = vk_create_pipeline("shaders/spv/texture3d.vert.spv", "shaders/spv/texture3d.frag.spv");
        render_cube(render3d);
        pipeline3d->rendering = render3d;
        self->vk_renderers[0].pipeline = pipeline3d;
        vk_create_renderer(vk_state, &self->vk_renderers[0], self->canvas_width, self->canvas_height);
    }

    {
        struct vulkan_renderbuffer *render2d = vk_create_renderbuffer(3, 3, 2, 0, CUBE_VERTEX_COUNT, CUBE_INDICE_COUNT);
        struct vulkan_pipeline *pipeline2d = vk_create_pipeline("shaders/spv/texture2d.vert.spv", "shaders/spv/texture2d.frag.spv");
        render_cube(render2d);
        pipeline2d->rendering = render2d;
        self->vk_renderers[1].pipeline = pipeline2d;
        vk_create_renderer(vk_state, &self->vk_renderers[1], self->canvas_width, self->canvas_height);
    }

    wad_load_resources(rs);

    return self;
}

void state_update(__attribute__((unused)) state *self) {
}

static void draw3d(SDL_Window *window, vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    int current_frame = vk_state->current_frame;

    VkResult vkres;

    vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_renderer->vk_flight_fences[current_frame], VK_TRUE, VK_SYNC_TIMEOUT);
    vk_ok(vkres);

    uint32_t image_index;
    vkres = vkAcquireNextImageKHR(vk_state->vk_device, vk_renderer->swapchain->vk_swapchain, VK_SYNC_TIMEOUT, vk_renderer->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vk_recreate_swapchain(vk_state, vk_renderer, width, height);
        return;
    } else {
        vk_ok(vkres);
    }

    struct uniform_buffer_object ubo = {0};
    float view[16];
    float perspective[16];
    static float x = 0.0f;
    x += 0.001f;
    vec3 eye = {3 + x, 3, 5};
    vec3 center = {0, 0, 0};
    matrix_look_at(view, &eye, &center);
    matrix_translate(view, -eye.x, -eye.y, -eye.z);
    float ratio = (float)vk_renderer->swapchain->swapchain_extent.width / (float)vk_renderer->swapchain->swapchain_extent.height;
    matrix_perspective(perspective, 60.0, 0.01, 100, ratio);
    matrix_multiply(ubo.mvp, perspective, view);

    vk_update_uniform_buffer(vk_state, vk_renderer, image_index, ubo);

    if (vk_renderer->vk_images_in_flight[image_index] != VK_NULL_HANDLE) {
        vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_renderer->vk_images_in_flight[image_index], VK_TRUE, VK_SYNC_TIMEOUT);
        vk_ok(vkres);
    }

    vk_renderer->vk_images_in_flight[image_index] = vk_renderer->vk_flight_fences[current_frame];

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

    VkSemaphore wait_semaphores[1] = {vk_renderer->vk_image_available_semaphores[current_frame]};
    VkPipelineStageFlags wait_stages[1] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};

    submit_info.waitSemaphoreCount = 1;
    submit_info.pWaitSemaphores = wait_semaphores;
    submit_info.pWaitDstStageMask = wait_stages;
    submit_info.commandBufferCount = 1;
    submit_info.pCommandBuffers = &vk_renderer->vk_command_buffers[image_index];

    VkSemaphore signal_semaphores[1] = {vk_renderer->vk_render_finished_semaphores[current_frame]};

    submit_info.signalSemaphoreCount = 1;
    submit_info.pSignalSemaphores = signal_semaphores;

    vkres = vkResetFences(vk_state->vk_device, 1, &vk_renderer->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    vkres = vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, vk_renderer->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    VkSwapchainKHR swapchains[1] = {vk_renderer->swapchain->vk_swapchain};

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
        vk_recreate_swapchain(vk_state, vk_renderer, width, height);
    } else {
        vk_ok(vkres);
    }

    vk_state->current_frame = (current_frame + 1) % VULKAN_MAX_FRAMES_IN_FLIGHT;
}

void state_render(state *self) {
    log("draw. ");
    draw3d(self->window, self->vk_state, &self->vk_renderers[0]);
}

void delete_state(state *self) {
    printf("delete state %p\n", (void *)self);
}
