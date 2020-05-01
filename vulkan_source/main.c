#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

static void window_init(SDL_Window **win, vulkan_state *vk_state) {

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        fprintf(stderr, "Could not initialize SDL: %s\n", SDL_GetError());
        exit(1);
    }

    Uint32 window_flags = SDL_WINDOW_VULKAN | SDL_WINDOW_SHOWN;
    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil Vulkan", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, window_flags);

    if (window == NULL) {
        fprintf(stderr, "Window could not be created: %s\n", SDL_GetError());
        exit(1);
    }

    VkInstanceCreateInfo vk_info = vk_info_initialize(window);

    if (vkCreateInstance(&vk_info, NULL, &vk_state->vk_instance) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Instance\n");
        exit(1);
    }

    if (!SDL_Vulkan_CreateSurface(window, vk_state->vk_instance, &vk_state->vk_surface)) {
        fprintf(stderr, "SDL Vulkan Create Surface: %s\n", SDL_GetError());
        exit(1);
    }

    vk_physical_device_initialize(vk_state);
    vk_create_logical_device(vk_state);
    vk_create_swapchain(vk_state, SCREEN_WIDTH, SCREEN_HEIGHT);
    vk_create_image_views(vk_state);
    vk_create_render_pass(vk_state);
    vk_create_graphics_pipeline(vk_state);
    vk_create_framebuffers(vk_state);
    vk_create_command_pool(vk_state);
    vk_create_command_buffers(vk_state);
    vk_create_semaphores(vk_state);

    *win = window;
}

static void draw(vulkan_state *vk_state) {

    int current_frame = vk_state->current_frame;

    vkWaitForFences(vk_state->vk_device, 1, &vk_state->vk_flight_fences[current_frame], VK_TRUE, UINT64_MAX);

    uint32_t image_index;
    vkAcquireNextImageKHR(vk_state->vk_device, vk_state->vk_swapchain, UINT64_MAX, vk_state->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (vk_state->vk_images_in_flight[image_index] != VK_NULL_HANDLE) {
        vkWaitForFences(vk_state->vk_device, 1, &vk_state->vk_images_in_flight[image_index], VK_TRUE, UINT64_MAX);
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

    vkResetFences(vk_state->vk_device, 1, &vk_state->vk_flight_fences[current_frame]);

    if (vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, vk_state->vk_flight_fences[current_frame]) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Queue Submit\n");
        exit(1);
    }

    VkSwapchainKHR swapchains[1] = {vk_state->vk_swapchain};

    VkPresentInfoKHR present_info = {0};
    present_info.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
    present_info.waitSemaphoreCount = 1;
    present_info.pWaitSemaphores = signal_semaphores;
    present_info.swapchainCount = 1;
    present_info.pSwapchains = swapchains;
    present_info.pImageIndices = &image_index;

    vkQueuePresentKHR(vk_state->vk_present_queue, &present_info);

    vk_state->current_frame = (current_frame + 1) % VULKAN_MAX_FRAMES_IN_FLIGHT;
}

static void main_loop(vulkan_state *vk_state) {
    SDL_Event event;
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            switch (event.type) {
            case SDL_QUIT: run = false; break;
            case SDL_KEYDOWN: {
                switch (event.key.keysym.sym) {
                case SDLK_ESCAPE: run = false; break;
                }
            }
            }
        }
        draw(vk_state);
    }
    vkDeviceWaitIdle(vk_state->vk_device);
}

int main() {
    SDL_Window *window = NULL;
    vulkan_state vk_state = {0};

    window_init(&window, &vk_state);

    SDL_StartTextInput();

    main_loop(&vk_state);

    SDL_StopTextInput();
    vulkan_quit(&vk_state);
    SDL_Quit();

    return 0;
}
