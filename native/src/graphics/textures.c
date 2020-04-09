#include "shaders.h"

GLint load_gl_texture(char *path) {
    SDL_Surface *bmp = SDL_LoadBMP(path);
    if (bmp == NULL) {
        printf("Failed to load bitmap: %s\n", SDL_GetError());
        exit(1);
    }
    return (GLint)0;
}
