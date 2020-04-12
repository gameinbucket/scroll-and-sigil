#include "hero.h"

void hero_update(void *void_self) {
    hero *self = void_self;
    self->super.delta_x = 1;
}

hero *hero_init() {
    hero *h = safe_calloc(1, sizeof(hero));
    h->super.type = THING_TYPE_HERO;
    h->super.update = hero_update;
    return h;
}
