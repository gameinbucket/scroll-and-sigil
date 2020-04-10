#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/system.h"
#include "graphics/framebuffer.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/renderbuffer.h"
#include "graphics/shaders.h"
#include "graphics/textures.h"

const int SCREEN_WIDTH = 640;
const int SCREEN_HEIGHT = 480;

bool run = true;

void input(unsigned char key, int x, int y) {
    if (key == 'q') {
        run = false;
    }
    printf("%d %d\n", x, y);
}

void update() {
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

void render() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glRotatef(0.4f, 0.0f, 1.0f, 0.0f);
    glRotatef(0.2f, 1.0f, 1.0f, 1.0f);
    glColor3f(0.0f, 1.0f, 0.0f);

    glBegin(GL_QUADS);
    glVertex2f(-0.5f, -0.5f);
    glVertex2f(0.5f, -0.5f);
    glVertex2f(0.5f, 0.5f);
    glVertex2f(-0.5f, 0.5f);
    glEnd();
}

void opengl_initial_settings() {
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

void resize() {
}

void initialize_render_system() {
    GLint program = make_program("resources/shaders/tri.vert", "resources/shaders/tri.frag");
    texture_t *texture = make_texture("resources/textures/front-death-0.bmp", GL_CLAMP_TO_EDGE, GL_LINEAR);

    GLint internal[1] = {GL_RGB};
    GLint format[1] = {GL_RGB};
    GLint type[1] = {GL_UNSIGNED_BYTE};

    framebuffer *frame = framebuffer_init(SCREEN_WIDTH, SCREEN_HEIGHT, 1, internal, format, type, true, true);
    make_fbo(frame);

    float perspective[16];
    float orthographic[16];

    float mv[16];
    float mvp[16];

    float fov = 60.0;
    float ratio = (float)SCREEN_WIDTH / (float)SCREEN_HEIGHT;

    matrix_perspective(perspective, fov, 0.01, 100.0, ratio);
    matrix_orthographic(orthographic, 0.0, SCREEN_WIDTH, 0.0, SCREEN_HEIGHT, 0.0, 1.0);

    resize();

    ////

    renderbuffer *screen = renderbuffer_init(2, 0, 0, 4, 6);
    renderbuffer *frame_screen = renderbuffer_init(2, 0, 0, 4, 6);
    renderbuffer *draw_image_b = renderbuffer_init(2, 0, 2, 40, 60);

    graphics_make_vao(screen);
    graphics_make_vao(frame_screen);
    graphics_make_vao(draw_image_b);

    renderbuffer_zero(screen);
    renderbuffer_zero(frame_screen);
    renderbuffer_zero(draw_image_b);

    ////

    // graphics_bind_fbo(frame->fbo);

    graphics_set_view(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    glUseProgram(program);

    graphics_set_orthographic(orthographic, 0, 0, mvp, mv);
    graphics_set_mvp(program, mvp);

    glBindTexture(GL_TEXTURE_2D, texture->id);
}

void loop(SDL_Window *window) {
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
        render();
        SDL_GL_SwapWindow(window);
    }
}

int main() {
    SDL_Window *window = NULL;
    window_init(&window);

    opengl_initial_settings();
    initialize_render_system();

    SDL_StartTextInput();

    loop(window);

    SDL_StopTextInput();
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
