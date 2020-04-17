#include "wad.h"

void wad_load_resources(renderstate *rs) {

    rs->shaders = safe_malloc(4 * sizeof(shader *));
    rs->shaders[SHADER_SCREEN] = shader_make("screen", "shaders/screen.vert", "shaders/screen.frag");
    rs->shaders[SHADER_TEXTURE_2D] = shader_make("texture2d", "shaders/texture2d.vert", "shaders/texture2d.frag");
    rs->shaders[SHADER_TEXTURE_3D] = shader_make("texture3d", "shaders/texture3d.vert", "shaders/texture3d.frag");
    rs->shaders[SHADER_TEXTURE_3D_COLOR] = shader_make("texture3d-color", "shaders/texture3d-color.vert", "shaders/texture3d-color.frag");

    rs->textures = safe_malloc(2 * sizeof(texture *));
    rs->textures[TEXTURE_BARON] = texture_make("textures/front-death-0.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
    rs->textures[TEXTURE_PLANK] = texture_make("textures/plank-floor.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
}

void wad_load_map(world *w) {

    place_flat(w);

    hero *h = hero_init();
    world_add_thing(w, &h->super);
}
