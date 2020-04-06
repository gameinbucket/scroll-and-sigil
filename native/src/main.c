#include <GL/gl.h>
#include <SDL2/SDL.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

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

int main() {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("Could not initialize SDL: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN);
    SDL_GLContext context = SDL_GL_CreateContext(window);

    if (context == NULL) {
        printf("OpenGL context could not be created: %s\n", SDL_GetError());
        return 1;
    }

    if (SDL_GL_SetSwapInterval(1) < 0) {
        printf("Could not set VSync: %s\n", SDL_GetError());
    }

    GLenum error = GL_NO_ERROR;

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        return 1;
    }

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        return 1;
    }

    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

    error = glGetError();
    if (error != GL_NO_ERROR) {
        printf("OpenGL error: %d\n", error);
        return 1;
    }

    SDL_Event event;
    SDL_StartTextInput();
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
    SDL_StopTextInput();

    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
