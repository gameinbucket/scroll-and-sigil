#ifndef PLACE_H
#define PLACE_H

#include "assets/assets.h"
#include "core/mem.h"
#include "map/sector.h"
#include "world/world.h"

void place_flat(world *w);
void place_house(world *w, int x, int y);

#endif
