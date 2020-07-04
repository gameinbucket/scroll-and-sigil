#include "image.h"

void simple_image_free(simple_image *self) {
    free(self->pixels);
    free(self);
}
