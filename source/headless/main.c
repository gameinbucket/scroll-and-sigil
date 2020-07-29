#include "main.h"

int main() {
    printf("----------------------------------------------------------------------\n");

    world *w = create_world();

    // load resources
    // read loading script
    // load map
    // load camera and find target

    // {
    //     place_flat(w);
    //     place_house(w, 10, 10);
    //     place_house(w, 40, 60);

    //     world_build_map(w);

    //     create_hero(in, w, 10, 40, model_system_get_model(ms, "human"));
    //     create_baron(w, 8, 45, model_system_get_model(ms, "human"));

    //     create_blood(w, 5, 1, 30);
    //     create_tree(w, 14, 42);
    // }

    world_update(w);
    delete_world(w);

    printf("success!\n");
    return 0;
}
