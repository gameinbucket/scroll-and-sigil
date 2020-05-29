#ifndef WORLD_BUILD_H
#define WORLD_BUILD_H

#include <float.h>
#include <math.h>

#include "core/mem.h"
#include "data/array.h"
#include "map/sector.h"
#include "map/triangulate.h"
#include "things/hero.h"

#include "world.h"

void world_build_map(world *self);

#endif
