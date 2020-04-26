#ifndef STATE_H
#define STATE_H

#include <math.h>

#include "data/uint_table.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/sprite.h"
#include "graphics/texture.h"
#include "graphics/vector.h"
#include "world/world.h"
#include "world/worldbuild.h"

#include "camera.h"
#include "input.h"
#include "renderstate.h"
#include "soundstate.h"
#include "wad.h"
#include "worldrender.h"

typedef struct state state;

struct state {
    input in;
    renderstate *rs;
    soundstate *ss;
    world *w;
    camera *c;
    worldrender *wr;
};

state *new_state(world *w, renderstate *rs, soundstate *ss);

void state_update(state *self);
void state_render(state *self);

void destroy_state(state *self);

#endif
