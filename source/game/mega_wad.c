#include "mega_wad.h"

void mega_wad_load_resources() {

    printf("\n");
}

void mega_wad_load_map(world *w, input *in, modelstate *ms) {

    place_flat(w);
    place_house(w, 10, 10);
    place_house(w, 40, 60);

    world_build_map(w);

    create_hero(in, w, 10, 40, modelstate_get_model(ms, "human"));
    create_baron(w, 8, 45, modelstate_get_model(ms, "human"));

    create_blood(w, 5, 1, 30);
    create_tree(w, 14, 42);
}
