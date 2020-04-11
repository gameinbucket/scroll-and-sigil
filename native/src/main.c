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

#include "renderstate.h"
#include "state.h"

const int SCREEN_WIDTH = 640;
const int SCREEN_HEIGHT = 480;

bool run = true;

void input(unsigned char key, int x, int y) {
    if (key == 'q') {
        run = false;
    }
    printf("%d %d\n", x, y);
}

void window_init(SDL_Window **win) {

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("Could not initialize SDL: %s\n", SDL_GetError());
        exit(1);
    }

    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN);
    SDL_GLContext context = SDL_GL_CreateContext(window);

    if (context == NULL) {
        printf("OpenGL context could not be created: %s\n", SDL_GetError());
        exit(1);
    }

    if (SDL_GL_SetSwapInterval(1) < 0) {
        printf("Could not set VSync: %s\n", SDL_GetError());
    }

    GLenum result = glewInit();
    if (result != GLEW_OK) {
        printf("Failed to initialize GLEW: %d\n", result);
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

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    GLenum error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        exit(1);
    }
}

renderstate *renderstate_settings() {

    renderstate *rs = renderstate_init();

    rs->canvas_width = SCREEN_WIDTH;
    rs->canvas_height = SCREEN_HEIGHT;

    renderbuffer *screen = renderbuffer_init(2, 0, 0, 4, 6);
    renderbuffer *frame_screen = renderbuffer_init(2, 0, 0, 4, 6);
    renderbuffer *draw_images = renderbuffer_init(2, 0, 2, 40, 60);
    renderbuffer *draw_colors = renderbuffer_init(2, 3, 0, 40, 60);

    graphics_make_vao(screen);
    graphics_make_vao(frame_screen);
    graphics_make_vao(draw_images);
    graphics_make_vao(draw_colors);

    rs->screen = screen;
    rs->frame_screen = frame_screen;
    rs->draw_images = draw_images;
    rs->draw_colors = draw_colors;

    renderstate_resize(rs, SCREEN_WIDTH, SCREEN_HEIGHT);

    rs->shaders = safe_calloc(2, sizeof(GLint));
    rs->shaders[SHADER_SCREEN] = shader_make("screen", "shaders/screen.vert", "shaders/screen.frag");
    rs->shaders[SHADER_TEXTURE_2D] = shader_make("texture2d", "shaders/texture2d.vert", "shaders/texture2d.frag");

    rs->textures = safe_calloc(1, sizeof(texture));
    texture *texture_front = texture_make("textures/front-death-0.bmp", GL_CLAMP_TO_EDGE, GL_LINEAR);

    rs->textures[0] = texture_front;

    return rs;
}

void main_loop(SDL_Window *window, state *s) {
    SDL_Event event;
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            if (event.type == SDL_QUIT) {
                run = false;
            } else if (event.type == SDL_TEXTINPUT) {
                int x = 0;
                int y = 0;
                SDL_GetMouseState(&x, &y);
                input(event.text.text[0], x, y);
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

    state *s = state_init(w, rs);

    SDL_StartTextInput();

    main_loop(window, s);

    SDL_StopTextInput();
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
