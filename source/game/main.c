#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/system.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/renderbuffer.h"
#include "graphics/shader.h"
#include "graphics/texture.h"

#include "world/world.h"
#include "world/worldbuild.h"

#include "renderstate.h"
#include "state.h"

const int SCREEN_WIDTH = 640;
const int SCREEN_HEIGHT = 480;

bool run = true;

void window_init(SDL_Window **win) {

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        fprintf(stderr, "Could not initialize SDL: %s\n", SDL_GetError());
        exit(1);
    }

    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN);
    SDL_GLContext context = SDL_GL_CreateContext(window);

    if (context == NULL) {
        fprintf(stderr, "OpenGL context could not be created: %s\n", SDL_GetError());
        exit(1);
    }

    if (SDL_GL_SetSwapInterval(1) < 0) {
        fprintf(stderr, "Could not set VSync: %s\n", SDL_GetError());
    }

    GLenum result = glewInit();
    if (result != GLEW_OK) {
        fprintf(stderr, "Failed to initialize GLEW: %d\n", result);
        exit(1);
    }

    *win = window;
}

void opengl_settings() {
    glClearColor(0.0, 0.0, 0.0, 1.0);
    glDepthFunc(GL_LEQUAL);
    glCullFace(GL_BACK);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glDisable(GL_CULL_FACE);
    glDisable(GL_BLEND);
    glDisable(GL_DEPTH_TEST);

    GLenum error = glGetError();
    if (error != GL_NO_ERROR) {
        fprintf(stderr, "OpenGL error: %d\n", error);
        exit(1);
    }
}

renderstate *renderstate_settings() {

    renderstate *rs = renderstate_init();

    rs->canvas_width = SCREEN_WIDTH;
    rs->canvas_height = SCREEN_HEIGHT;

    rs->screen = renderbuffer_init(2, 0, 0, 4, 6, false);
    rs->frame_screen = renderbuffer_init(2, 0, 0, 4, 6, false);
    rs->draw_images = renderbuffer_init(2, 0, 2, 40, 60, true);
    rs->draw_colors = renderbuffer_init(2, 3, 0, 40, 60, true);
    rs->draw_sectors = renderbuffer_init(3, 0, 2, 4 * 200, 36 * 200, true);
    rs->draw_sprites = renderbuffer_init(3, 0, 2, 4 * 200, 36 * 200, true);

    graphics_make_vao(rs->screen);
    graphics_make_vao(rs->frame_screen);
    graphics_make_vao(rs->draw_images);
    graphics_make_vao(rs->draw_colors);
    graphics_make_vao(rs->draw_sectors);
    graphics_make_vao(rs->draw_sprites);

    renderstate_resize(rs, SCREEN_WIDTH, SCREEN_HEIGHT);

    wad_load_resources(rs);

    return rs;
}

void main_loop(SDL_Window *window, state *s) {
    SDL_Event event;
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            switch (event.type) {
            case SDL_QUIT: run = false; break;
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
                }
                break;
            }
            }
        }
        state_update(s);
        state_render(s);
        SDL_GL_SwapWindow(window);
    }
}

int main() {
    SDL_Window *window = NULL;
    window_init(&window);

    opengl_settings();

    renderstate *rs = renderstate_settings();

    world *w = world_init();
    wad_load_map(rs, w);
    world_build_map(w);

    state *s = state_init(w, rs);

    SDL_StartTextInput();

    main_loop(window, s);

    SDL_StopTextInput();
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
