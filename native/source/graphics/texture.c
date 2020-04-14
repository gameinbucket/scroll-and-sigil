#include "texture.h"

texture *texture_init(GLuint id, int width, int height) {
    texture *t = safe_malloc(sizeof(texture));
    t->id = id;
    t->width = width;
    t->height = height;
    return t;
}

texture *texture_make(char *path, GLint clamp, GLint interpolate) {
    SDL_Surface *png = IMG_Load(path);
    if (png == NULL) {
        fprintf(stderr, "Failed to load image: %s\n", SDL_GetError());
        exit(1);
    }

    int width = png->w;
    int height = png->h;

    GLuint id;
    glGenTextures(1, &id);
    glBindTexture(GL_TEXTURE_2D, id);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, clamp);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, clamp);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, interpolate);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, interpolate);

    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, png->pixels);

    glBindTexture(GL_TEXTURE_2D, 0);

    SDL_FreeSurface(png);

    return texture_init(id, width, height);
}
