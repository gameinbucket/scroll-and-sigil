#include "image.h"

void delete_image_pixels(image_pixels *self) {
    free(self->pixels);
    free(self);
}
