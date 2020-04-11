#include "sprite.h"

void simple_sprite(float *s, float left, float top, float width, float height, float atlas_width, float atlas_height) {
    s[0] = left * atlas_width;
    s[1] = top * atlas_height;
    s[2] = (left + width) * atlas_width;
    s[3] = (top + height) * atlas_height;
}

sprite *sprite_init(int *atlas, int atlas_width, int atlas_height, bool offset) {
    sprite *s = safe_malloc(sizeof(sprite));
    s->atlas = atlas;

    s->left = (float)atlas[0] * (float)atlas_width;
    s->top = (float)atlas[1] * (float)atlas_height;
    s->right = (float)(atlas[0] + atlas[2]) * (float)atlas_width;
    s->bottom = (float)(atlas[1] + atlas[3]) * (float)atlas_height;

    s->width = atlas[2];
    s->height = atlas[3];

    if (offset) {
        s->offset_x = atlas[4];
        s->offset_y = atlas[5];
    } else {
        s->offset_x = 0;
        s->offset_y = 0;
    }

    return s;
}
