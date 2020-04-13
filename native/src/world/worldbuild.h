#ifndef WORLD_BUILD_H
#define WORLD_BUILD_H

#include "core/mem.h"
#include "graphics/renderbuffer.h"
#include "map/sector.h"
#include "map/triangulate.h"
#include "things/hero.h"
#include "things/thing.h"

#include "world.h"

void world_build_map(world *self);

#endif
