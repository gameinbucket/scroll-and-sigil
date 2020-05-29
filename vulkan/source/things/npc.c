#include "npc.h"

void npc_try_move(__attribute__((unused)) thing *self, __attribute__((unused)) float x, __attribute__((unused)) float z) {
}

bool npc_move(__attribute__((unused)) thing *self) {
    return false;
}

npc_info *npc_parse(wad_element *npc_wad) {

    npc_info *info = safe_calloc(1, sizeof(npc_info));

    float box = wad_get_float(wad_get_required_from_object(npc_wad, "box"));
    float height = wad_get_float(wad_get_required_from_object(npc_wad, "height"));
    string *model_name = wad_get_string(wad_get_from_object(npc_wad, "model"));
    string *sprite_name = wad_get_string(wad_get_from_object(npc_wad, "sprite"));

    info->box = box;
    info->height = height;
    info->model_name = model_name;
    info->sprite_name = sprite_name;

    return info;
}
