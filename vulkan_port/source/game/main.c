#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

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

    *win = window;
}

static void main_loop(state *s) {
    SDL_Event event = {0};
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            switch (event.type) {
            case SDL_QUIT: run = false; break;
            case SDL_WINDOWEVENT_RESIZED: window_resize(s->vk_state); break;
            case SDL_KEYDOWN: {
                switch (event.key.keysym.sym) {
                case SDLK_q:
                case SDLK_ESCAPE: run = false; break;
                }
            }
            }
        }
        // sleep_ms(16);
        state_update(s);
        state_render(s);
    }
    VkResult vkres = vkDeviceWaitIdle(s->vk_state->vk_device);
    vk_ok(vkres);
}

int main() {
    printf("----------------------------------------------------------------------\n");

    SDL_Window *window = NULL;
    vulkan_state vk_state = {0};

    window_init(&window, &vk_state);

    renderstate *rs = create_renderstate();
    state *s = create_state(window, rs, &vk_state);

    SDL_StartTextInput();

    main_loop(s);

    SDL_StopTextInput();
    delete_vulkan_renderer(&vk_state, &s->vk_renderers[0]);
    delete_vulkan_renderer(&vk_state, &s->vk_renderers[1]);
    delete_vulkan_state(&vk_state);
    SDL_Quit();

    return 0;
}
