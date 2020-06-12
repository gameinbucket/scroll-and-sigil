#include "camera.h"

camera *create_camera(float radius) {
    camera *c = safe_calloc(1, sizeof(camera));
    c->radius = radius;
    return c;
}

void camera_update(camera *self) {

    float sin_x = sinf(self->rx);
    float cos_x = cosf(self->rx);
    float sin_y = sinf(self->ry);
    float cos_y = cosf(self->ry);

    self->x = self->target->x - self->radius * cos_x * sin_y;
    self->y = self->target->y + self->radius * sin_x + self->target->height;
    self->z = self->target->z + self->radius * cos_x * cos_y;
}
