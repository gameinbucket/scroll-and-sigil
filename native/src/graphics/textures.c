#include "textures.h"

texture_t *texture_init(GLint id, int width, int height) {
    texture_t *t = safe_malloc(sizeof(texture_t));
    t->id = id;
    t->width = width;
    t->height = height;
    return t;
}

texture_t *make_texture(char *path, GLint clamp, GLint interpolate) {
    SDL_Surface *bmp = SDL_LoadBMP(path);
    if (bmp == NULL) {
        printf("Failed to load bitmap: %s\n", SDL_GetError());
        exit(1);
    }

    int width = bmp->w;
    int height = bmp->h;

    GLuint texture = 0;

    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, clamp);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, clamp);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, interpolate);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, interpolate);

    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, bmp->pixels);

    SDL_FreeSurface(bmp);

    return texture_init(texture, width, height);
}
