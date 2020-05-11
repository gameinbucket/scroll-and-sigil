#include "shader.h"

shader *create_shader(__attribute__((unused)) struct zip *z, __attribute__((unused)) char *vert, __attribute__((unused)) char *frag) {

    shader *self = safe_malloc(sizeof(shader));

    return self;
}
