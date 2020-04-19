#ifndef PLACE_H
#define PLACE_H

#include "core/mem.h"
#include "game/renderstate.h"
#include "game/wad.h"
#include "map/sector.h"
#include "world/world.h"

sector *place_flat(renderstate *rs, world *w);

#endif
