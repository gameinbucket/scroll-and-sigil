#ifndef STATE_H
#define STATE_H

#include "graphics/graphics.h"
#include "graphics/render.h"
#include "graphics/texture.h"
#include "renderstate.h"
#include "world.h"

struct state {
    renderstate *rs;
    world *w;
};

typedef struct state state;

state *state_init(world *w, renderstate *rs);
void state_update(state *self);
void state_render(state *self);

#endif
