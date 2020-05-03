#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

uint64_t VULKAN_TIMEOUT = 5; // UINT64_MAX;

#define log(message)                                                                                                                                                                                   \
    printf(message);                                                                                                                                                                                   \
    fflush(stdout)

static uint32_t vertex_count = 4;
static float vertices[] = {-0.5f, -0.5f, 1.0f, 0.0f, 0.0f, 0.5f, -0.5f, 0.0f, 1.0f, 0.0f, 0.5f, 0.5f, 0.0f, 0.0f, 1.0f, -0.5f, 0.5f, 1.0f, 1.0f, 1.0f};

static uint32_t index_count = 6;
static uint32_t indices[] = {0, 1, 2, 2, 3, 0};

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

    vk_state->position = 2;
    vk_state->color = 3;
    vk_state->vertex_stride = 2 + 3;
    vk_state->vertices = vertices;
    vk_state->vertex_count = vertex_count;

    vk_state->indices = indices;
    vk_state->index_count = index_count;

    vk_create(vk_state, SCREEN_WIDTH, SCREEN_HEIGHT);

    *win = window;
}

static void draw(SDL_Window *window, vulkan_state *vk_state) {

    int current_frame = vk_state->current_frame;

    vk_ok(vkWaitForFences(vk_state->vk_device, 1, &vk_state->vk_flight_fences[current_frame], VK_TRUE, VULKAN_TIMEOUT));

    uint32_t image_index;
    VkResult acquire_result = vkAcquireNextImageKHR(vk_state->vk_device, vk_state->vk_swapchain, VULKAN_TIMEOUT, vk_state->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (acquire_result == VK_ERROR_OUT_OF_DATE_KHR) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vk_recreate_swapchain(vk_state, width, height);
        return;
    } else {
        vk_ok(acquire_result);
    }

    vk_update_uniform_buffer(vk_state, image_index);

    if (vk_state->vk_images_in_flight[image_index] != VK_NULL_HANDLE) {
        vk_ok(vkWaitForFences(vk_state->vk_device, 1, &vk_state->vk_images_in_flight[image_index], VK_TRUE, VULKAN_TIMEOUT));
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

    vk_ok(vkResetFences(vk_state->vk_device, 1, &vk_state->vk_flight_fences[current_frame]));

    vk_ok(vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, vk_state->vk_flight_fences[current_frame]));

    VkSwapchainKHR swapchains[1] = {vk_state->vk_swapchain};

    VkPresentInfoKHR present_info = {0};
    present_info.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
    present_info.waitSemaphoreCount = 1;
    present_info.pWaitSemaphores = signal_semaphores;
    present_info.swapchainCount = 1;
    present_info.pSwapchains = swapchains;
    present_info.pImageIndices = &image_index;

    VkResult present_result = vkQueuePresentKHR(vk_state->vk_present_queue, &present_info);

    if (present_result == VK_ERROR_OUT_OF_DATE_KHR || present_result == VK_SUBOPTIMAL_KHR || vk_state->framebuffer_resized) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vk_state->framebuffer_resized = false;
        vk_recreate_swapchain(vk_state, width, height);
    } else {
        vk_ok(present_result);
    }

    vk_state->current_frame = (current_frame + 1) % VULKAN_MAX_FRAMES_IN_FLIGHT;
}

static void main_loop(SDL_Window *window, vulkan_state *vk_state) {
    SDL_Event event;
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

        sleep_ms(16);
        log("wait. ");
        vk_ok(vkDeviceWaitIdle(vk_state->vk_device));
        log("done. ");
        sleep_ms(16);

        run = false;
    }
    vk_ok(vkDeviceWaitIdle(vk_state->vk_device));
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
