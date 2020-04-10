#include "rendersystem.h"

rendersystem *rendersystem_init() {
    rendersystem *r = safe_malloc(sizeof(rendersystem));
    return r;
}

void rendersystem_set_texture(rendersystem *self) {
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, self->textures[0]);
    glUniform1i(self->texture_ids[0], 0);
}
