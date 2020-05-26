#include "texture.h"

static texture *texture_init(char *path, GLuint id, int width, int height) {
    texture *t = safe_malloc(sizeof(texture));
    t->path = string_init(path);
    t->id = id;
    t->width = width;
    t->height = height;
    return t;
}

static void gen(GLuint *id, GLint clamp, GLint interpolate) {
    glGenTextures(1, id);
    glBindTexture(GL_TEXTURE_2D, *id);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, clamp);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, clamp);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, interpolate);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, interpolate);
}

texture *texture_make(struct zip *z, char *path, GLint clamp, GLint interpolate) {
    simple_image *png = read_png_file(z, path);
    int width = png->width;
    int height = png->height;
    GLuint id;
    gen(&id, clamp, interpolate);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, png->pixels);
    glBindTexture(GL_TEXTURE_2D, 0);
    simple_image_free(png);
    return texture_init(path, id, width, height);
}

texture *create_texture_pixels(int width, int height, GLint clamp, GLint interpolate, GLint internal_format, GLint format, GLint type, const void *pixels) {
    GLuint id;
    gen(&id, clamp, interpolate);
    glTexImage2D(GL_TEXTURE_2D, 0, internal_format, width, height, 0, format, type, pixels);
    glBindTexture(GL_TEXTURE_2D, 0);
    return texture_init("", id, width, height);
}
