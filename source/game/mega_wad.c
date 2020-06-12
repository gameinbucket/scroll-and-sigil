#include "mega_wad.h"

void mega_wad_load_resources() {

    printf("\n");
}

void mega_wad_load_map(world *w) {

    place_flat(w);
    place_house(w, 10, 10);
    place_house(w, 40, 60);

    world_build_map(w);

    create_blood(w, 5, 1, 30);
    create_tree(w, 14, 42);
}
