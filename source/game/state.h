#ifndef STATE_H
#define STATE_H

#include <math.h>

#include "data/uint_table.h"
#include "graphics/sprite.h"
#include "math/matrix.h"
#include "math/vector.h"
#include "opengl/graphics.h"
#include "opengl/render.h"
#include "opengl/texture.h"
#include "world/world.h"
#include "world/worldbuild.h"

#include "camera.h"
#include "input/input.h"
#include "mega_wad.h"
#include "modelstate.h"
#include "renderstate.h"
#include "soundstate.h"
#include "worldrender.h"

typedef struct state state;

struct state {
    input in;
    renderstate *rs;
    soundstate *ss;
    modelstate *ms;
    world *w;
    camera *c;
    thing *h;
    worldrender *wr;
};

state *create_state(world *w, renderstate *rs, soundstate *ss);

void state_update(state *self);
void state_render(state *self);

void delete_state(state *self);

#endif
