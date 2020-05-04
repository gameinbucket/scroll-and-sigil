#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

uint64_t VK_SYNC_TIMEOUT = UINT64_MAX;

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

    vk_state->position = 3;
    vk_state->color = 3;
    vk_state->texture = 2;
    vk_state->vertex_stride = vk_state->position + vk_state->color + vk_state->texture + vk_state->normal;

    vk_state->vertices = safe_malloc(CUBE_VERTEX_FLOAT * sizeof(float));
    vk_state->vertex_count = CUBE_VERTEX_COUNT;

    vk_state->indices = safe_malloc(CUBE_INDICE_COUNT * sizeof(uint32_t));
    vk_state->index_count = CUBE_INDICE_COUNT;

    float cube[CUBE_VERTEX_FLOAT] = RENDER_CUBE(1, 1, 1);

    memcpy(vk_state->vertices, cube, CUBE_VERTEX_FLOAT * sizeof(float));

    uint32_t index_position = 0;
    uint32_t index_offset = 0;

    for (int k = 0; k < 6; k++)
        render_index4(&index_position, &index_offset, vk_state->indices);

    vk_create(vk_state, SCREEN_WIDTH, SCREEN_HEIGHT);

    *win = window;
}

static void draw(SDL_Window *window, vulkan_state *vk_state) {

    int current_frame = vk_state->current_frame;

    printf("current frame: %d. ", current_frame);
    fflush(stdout);

    VkResult vkres;

    vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_state->vk_flight_fences[current_frame], VK_TRUE, VK_SYNC_TIMEOUT);
    vk_ok(vkres);

    uint32_t image_index;
    vkres = vkAcquireNextImageKHR(vk_state->vk_device, vk_state->vk_swapchain, VK_SYNC_TIMEOUT, vk_state->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vk_recreate_swapchain(vk_state, width, height);
        return;
    } else {
        vk_ok(vkres);
    }

    vk_update_uniform_buffer(vk_state, image_index);

    if (vk_state->vk_images_in_flight[image_index] != VK_NULL_HANDLE) {
        vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_state->vk_images_in_flight[image_index], VK_TRUE, VK_SYNC_TIMEOUT);
        vk_ok(vkres);
    }

    vk_state->vk_images_in_flight[image_index] = vk_state->vk_flight_fences[current_frame];

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

    VkSemaphore wait_semaphores[1] = {vk_state->vk_image_available_semaphores[current_frame]};
    VkPipelineStageFlags wait_stages[1] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};

    submit_info.waitSemaphoreCount = 1;
    submit_info.pWaitSemaphores = wait_semaphores;
    submit_info.pWaitDstStageMask = wait_stages;
    submit_info.commandBufferCount = 1;
    submit_info.pCommandBuffers = &vk_state->vk_command_buffers[image_index];

    VkSemaphore signal_semaphores[1] = {vk_state->vk_render_finished_semaphores[current_frame]};

    submit_info.signalSemaphoreCount = 1;
    submit_info.pSignalSemaphores = signal_semaphores;

    vkres = vkResetFences(vk_state->vk_device, 1, &vk_state->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    vkres = vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, vk_state->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    VkSwapchainKHR swapchains[1] = {vk_state->vk_swapchain};

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
        vk_recreate_swapchain(vk_state, width, height);
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
                case SDLK_ESCAPE: run = false; break;
                }
            }
            }
        }
        log("draw. ");
        draw(window, vk_state);
        log("sleep. ");
        sleep_ms(2000);
        log("wait. ");
        VkResult vkres = vkDeviceWaitIdle(vk_state->vk_device);
        vk_ok(vkres);
        log("done. ");

        run = false;
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
    vk_quit(&vk_state);
    SDL_Quit();

    return 0;
}
