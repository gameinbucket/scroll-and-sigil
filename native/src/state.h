#ifndef STATE_H
#define STATE_H

#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/texture.h"

#include "world/world.h"

#include "camera.h"
#include "input.h"
#include "renderstate.h"
#include "worldrender.h"

struct state {
    input in;
    renderstate *rs;
    world *w;
    camera *c;
};

typedef struct state state;

state *state_init(world *w, renderstate *rs);
void state_update(state *self);
void state_render(state *self);

#endif
