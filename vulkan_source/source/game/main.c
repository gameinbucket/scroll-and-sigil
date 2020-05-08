#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

uint64_t VK_SYNC_TIMEOUT = 1000000000;

#define VULKAN_RENDERERS_COUNT 2
struct vulkan_renderer vk_renderers[VULKAN_RENDERERS_COUNT];

#define log(message)                                                                                                                                                                                   \
    printf(message);                                                                                                                                                                                   \
    fflush(stdout)

static void window_resize(vulkan_state *vk_state) {
    log("window resize\n");
    vk_state->framebuffer_resized = true;
}

static void window_init(SDL_Window **win, vulkan_state *vk_state) {

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        fprintf(stderr, "Could not initialize SDL: %s\n", SDL_GetError());
        exit(1);
    }

    Uint32 window_flags = SDL_WINDOW_VULKAN | SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE;
    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil Vulkan", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, window_flags);

    if (window == NULL) {
        fprintf(stderr, "Window could not be created: %s\n", SDL_GetError());
        exit(1);
    }

    vk_create_instance(window, vk_state);

    if (!SDL_Vulkan_CreateSurface(window, vk_state->vk_instance, &vk_state->vk_surface)) {
        fprintf(stderr, "SDL Vulkan Create Surface: %s\n", SDL_GetError());
        exit(1);
    }

    vk_create_state(vk_state);

    {
        struct vulkan_pipeline *pipeline2d = safe_calloc(1, sizeof(struct vulkan_pipeline));
        pipeline2d->vertex_shader_path = "2d.vert.spv";
        pipeline2d->fragment_shader_path = "2d.frag.spv";
        struct vulkan_render_buffer *render2d = safe_calloc(1, sizeof(struct vulkan_render_buffer));
        render2d->position = 3;
        render2d->color = 3;
        render2d->texture = 2;
        render2d->vertex_stride = render2d->position + render2d->color + render2d->texture + render2d->normal;
        render2d->vertices = safe_malloc(CUBE_VERTEX_FLOAT * sizeof(float));
        render2d->vertex_count = CUBE_VERTEX_COUNT;
        render2d->indices = safe_malloc(CUBE_INDICE_COUNT * sizeof(uint32_t));
        render2d->index_count = CUBE_INDICE_COUNT;
        float cube[CUBE_VERTEX_FLOAT] = RENDER_CUBE(1, 1, 1);
        memcpy(render2d->vertices, cube, CUBE_VERTEX_FLOAT * sizeof(float));
        uint32_t index_position = 0;
        uint32_t index_offset = 0;
        for (int k = 0; k < 6; k++)
            render_index4(&index_position, &index_offset, render2d->indices);
        pipeline2d->rendering = render2d;

        vk_renderers[1].pipeline = pipeline2d;
    }

    {
        struct vulkan_pipeline *pipeline3d = safe_calloc(1, sizeof(struct vulkan_pipeline));
        pipeline3d->vertex_shader_path = "3d.vert.spv";
        pipeline3d->fragment_shader_path = "3d.frag.spv";
        struct vulkan_render_buffer *render3d = safe_calloc(1, sizeof(struct vulkan_render_buffer));
        render3d->position = 3;
        render3d->color = 3;
        render3d->texture = 2;
        render3d->vertex_stride = render3d->position + render3d->color + render3d->texture + render3d->normal;
        render3d->vertices = safe_malloc(CUBE_VERTEX_FLOAT * sizeof(float));
        render3d->vertex_count = CUBE_VERTEX_COUNT;
        render3d->indices = safe_malloc(CUBE_INDICE_COUNT * sizeof(uint32_t));
        render3d->index_count = CUBE_INDICE_COUNT;
        float cube[CUBE_VERTEX_FLOAT] = RENDER_CUBE(1, 1, 1);
        memcpy(render3d->vertices, cube, CUBE_VERTEX_FLOAT * sizeof(float));
        uint32_t index_position = 0;
        uint32_t index_offset = 0;
        for (int k = 0; k < 6; k++)
            render_index4(&index_position, &index_offset, render3d->indices);
        pipeline3d->rendering = render3d;

        vk_renderers[0].pipeline = pipeline3d;
    }

    vk_create_renderer(vk_state, &vk_renderers[0], SCREEN_WIDTH, SCREEN_HEIGHT);
    vk_create_renderer(vk_state, &vk_renderers[1], SCREEN_WIDTH, SCREEN_HEIGHT);

    *win = window;
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

static void main_loop(SDL_Window *window, vulkan_state *vk_state) {
    SDL_Event event = {0};
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            switch (event.type) {
            case SDL_QUIT: run = false; break;
            case SDL_WINDOWEVENT_RESIZED: window_resize(vk_state); break;
            case SDL_KEYDOWN: {
                switch (event.key.keysym.sym) {
                case SDLK_q:
                case SDLK_ESCAPE: run = false; break;
                }
            }
            }
        }
        log("draw. ");
        draw3d(window, vk_state, &vk_renderers[0]);
        sleep_ms(16);
    }
    VkResult vkres = vkDeviceWaitIdle(vk_state->vk_device);
    vk_ok(vkres);
}

int main() {
    printf("----------------------------------------------------------------------\n");

    SDL_Window *window = NULL;
    vulkan_state vk_state = {0};

    window_init(&window, &vk_state);

    SDL_StartTextInput();

    main_loop(window, &vk_state);

    SDL_StopTextInput();
    delete_vulkan_renderer(&vk_state, &vk_renderers[0]);
    delete_vulkan_renderer(&vk_state, &vk_renderers[1]);
    delete_vulkan_state(&vk_state);
    SDL_Quit();

    return 0;
}
