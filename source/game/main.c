#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

#define FPS_ON
#define BILLION 1000000000L

static void window_resize(vulkan_state *vk_state) {
    LOG("window resize\n");
    vk_state->framebuffer_resized = true;
}

static void window_init(SDL_Window **win, vulkan_state *vk_state) {

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        fprintf(stderr, "Could not initialize SDL: %s\n", SDL_GetError());
        exit(1);
    }

    Uint32 window_flags = SDL_WINDOW_VULKAN | SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE;
    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, window_flags);

    if (window == NULL) {
        fprintf(stderr, "Window could not be created: %s\n", SDL_GetError());
        exit(1);
    }

    initialize_vulkan_instance(window, vk_state);

    if (!SDL_Vulkan_CreateSurface(window, vk_state->vk_instance, &vk_state->vk_surface)) {
        fprintf(stderr, "SDL Vulkan Create Surface: %s\n", SDL_GetError());
        exit(1);
    }

    initialize_vulkan_state(vk_state);

    *win = window;
}

static void main_loop(state *s) {

    unsigned int time = 0.0;
    unsigned int frames = 0;

    SDL_Event event = {0};
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            switch (event.type) {
            case SDL_QUIT: run = false; break;
            case SDL_WINDOWEVENT_RESIZED: window_resize(s->vk_state); break;
            case SDL_MOUSEBUTTONUP: {
                SDL_GetMouseState(&s->in.mouse_x, &s->in.mouse_y);
                s->in.mouse_down = false;
                break;
            }
            case SDL_MOUSEBUTTONDOWN: {
                SDL_GetMouseState(&s->in.mouse_x, &s->in.mouse_y);
                s->in.mouse_down = true;
                break;
            }
            case SDL_KEYUP: {
                switch (event.key.keysym.sym) {
                case SDLK_w: s->in.move_forward = false; break;
                case SDLK_a: s->in.move_left = false; break;
                case SDLK_s: s->in.move_backward = false; break;
                case SDLK_d: s->in.move_right = false; break;
                case SDLK_q: s->in.move_up = false; break;
                case SDLK_e: s->in.move_down = false; break;
                case SDLK_UP: s->in.look_up = false; break;
                case SDLK_DOWN: s->in.look_down = false; break;
                case SDLK_LEFT: s->in.look_left = false; break;
                case SDLK_RIGHT: s->in.look_right = false; break;
                }
                break;
            }
            case SDL_KEYDOWN: {
                switch (event.key.keysym.sym) {
                case SDLK_ESCAPE: run = false; break;
                case SDLK_w: s->in.move_forward = true; break;
                case SDLK_a: s->in.move_left = true; break;
                case SDLK_s: s->in.move_backward = true; break;
                case SDLK_d: s->in.move_right = true; break;
                case SDLK_q: s->in.move_up = true; break;
                case SDLK_e: s->in.move_down = true; break;
                case SDLK_UP: s->in.look_up = true; break;
                case SDLK_DOWN: s->in.look_down = true; break;
                case SDLK_LEFT: s->in.look_left = true; break;
                case SDLK_RIGHT: s->in.look_right = true; break;
                case SDLK_TAB: s->in.console = true; break;
                }
                break;
            }
            }
        }

#ifdef FPS_ON
        struct timeval start, stop;
        gettimeofday(&start, NULL);
#endif

        state_update(s);
        state_render(s);

#ifdef FPS_ON
        gettimeofday(&stop, NULL);
        unsigned int microseconds = (stop.tv_sec - start.tv_sec) * 1000000 + ((int)stop.tv_usec - (int)start.tv_usec);
        time += microseconds;
        frames++;
        if (time >= 1000000) {
            printf("frames per second: %d\n", frames);
            time -= 1000000;
            frames = 0;
        }
#endif
    }
    printf("\n");

    VkResult vkres = vkDeviceWaitIdle(s->vk_state->vk_device);
    vk_ok(vkres);
}

int main() {
    printf("----------------------------------------------------------------------\n");

    SDL_Window *window = NULL;
    vulkan_state vk_state = {0};

    window_init(&window, &vk_state);

    state *s = create_state(window, &vk_state);

    SDL_StartTextInput();

    main_loop(s);

    SDL_StopTextInput();
    printf("\n");
    delete_state(s);
    delete_vulkan_state(&vk_state);
    SDL_Quit();

    printf("\n");

    return 0;
}
