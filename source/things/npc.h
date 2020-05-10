#ifndef NPC_H
#define NPC_H

#include "world/world.h"

void npc_try_move(thing *self, float x, float z);
bool npc_move(thing *self);

#endif
