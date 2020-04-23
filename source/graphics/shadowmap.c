#include "shadowmap.h"

shadowmap *alloc_shadowmap(int width, int height) {
    shadowmap *self = safe_malloc(sizeof(shadowmap));
    self->width = width;
    self->height = height;
    return self;
}
