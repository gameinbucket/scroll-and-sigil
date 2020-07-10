#include "image_system.h"

image_system *create_image_system() {
    image_system *self = safe_calloc(1, sizeof(image_system));
    self->images = create_table(&table_string_equal, &table_string_hashcode);
    return self;
}

void image_system_add_image(image_system *self, char *name, image_details *info) {
    table_put(self->images, name, info);
}

image_details *image_system_get_image(image_system *self, char *name) {
    return table_get(self->images, name);
}

void delete_image_system(image_system *self) {
    free(self->images);
    free(self);
}
