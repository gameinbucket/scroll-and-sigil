#ifndef NPC_H
#define NPC_H

#include "world/world.h"

typedef struct npc_info npc_info;

struct npc_info {
    int status;
    int reaction;
    float box;
    float height;
    string *model_name;
    string *sprite_name;
    model *m;
    sprite *s;
};

typedef struct npc npc;

struct npc {
    thing super;
    int status;
    int reaction;
};

void npc_try_move(thing *self, float x, float z);
bool npc_move(thing *self);

void npc_update(void *void_self);
npc *create_npc(world *map, float x, float z, model *m);

npc_info *npc_parse(wad_element *npc_wad);

#endif
