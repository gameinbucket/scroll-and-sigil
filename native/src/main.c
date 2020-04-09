#include <GL/glew.h>

#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/system.h"
#include "graphics/shaders.h"
#include "graphics/textures.h"
#include "matrix/matrix.h"

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

void render() {
    glClear(GL_COLOR_BUFFER_BIT);

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

void setup(SDL_Window **win) {

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

    GLenum error = GL_NO_ERROR;

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        exit(1);
    }

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        exit(1);
    }

    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

    error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        exit(1);
    }

    *win = window;
}

void prepare_view() {
    GLint program_id = compile_gl_program("resources/shaders/tri.vert", "resources/shaders/tri.frag");
    GLint texture_id = load_gl_texture("resources/textures/front-death-0.bmp");

    glUseProgram(program_id);

    glBindTexture(GL_TEXTURE_2D, texture_id);
}

int main() {
    SDL_Window *window = NULL;
    setup(&window);

    prepare_view();

    SDL_StartTextInput();

    loop(window);

    SDL_StopTextInput();
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
