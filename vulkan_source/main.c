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
        fprintf(stderr, "Failed: Vulkan Create Instance\n");
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

    *win = window;
}

static void draw() {
}

static void main_loop() {
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
        draw();
    }
}

int main() {
    SDL_Window *window = NULL;
    vulkan_state vk_state;

    window_init(&window, &vk_state);

    SDL_StartTextInput();

    main_loop();

    SDL_StopTextInput();
    vulkan_quit(&vk_state);
    SDL_Quit();

    return 0;
}
