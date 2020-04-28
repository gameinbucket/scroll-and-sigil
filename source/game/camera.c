#include "camera.h"

camera *camera_init(float radius) {
    camera *c = safe_calloc(1, sizeof(camera));
    c->radius = radius;
    return c;
}

void camera_update(camera *self) {
    float sin_x = sinf(self->rx);
    float cos_x = cosf(self->rx);
    float sin_y = sinf(self->ry);
    float cos_y = cosf(self->ry);

    float dx = -cos_x * sin_y;
    float dy = sin_x;
    float dz = cos_x * cos_y;

    self->x = self->target->x + self->radius * dx;
    self->y = self->target->z + self->radius * dy + self->target->height;
    self->z = self->target->y + self->radius * dz;
}
