#include "mega_wad.h"

void wad_load_resources(renderstate *rs, soundstate *ss, modelstate *ms) {

    struct zip *z = NULL;
    const bool use_zip = false;

    if (use_zip) {
        z = open_zip_archive("scroll-and-sigil.wad");
    }

    string *wad_data = cat("wads/wad");
    wad_element *wad = parse_wad(wad_data);
    string_free(wad_data);
    string *wad_str = wad_to_string(wad);
    printf("\nmega wad %s\n", wad_str);
    string_free(wad_str);
    delete_wad(wad);

    rs->shaders = safe_malloc(SHADER_COUNT * sizeof(shader *));
    rs->shaders[SHADER_SCREEN] = shader_make(z, "shaders/screen.vert", "shaders/screen.frag");
    rs->shaders[SHADER_TEXTURE_2D] = shader_make(z, "shaders/texture2d.vert", "shaders/texture2d.frag");
    rs->shaders[SHADER_TEXTURE_3D] = shader_make(z, "shaders/texture3d.vert", "shaders/texture3d.frag");
    rs->shaders[SHADER_TEXTURE_3D_COLOR] = shader_make(z, "shaders/texture3d-color.vert", "shaders/texture3d-color.frag");
    rs->shaders[SHADER_TEXTURE_3D_SHADOWED] = shader_make(z, "shaders/texture3d-shadowed.vert", "shaders/texture3d-shadowed.frag");
    rs->shaders[SHADER_SHADOW_PASS] = shader_make(z, "shaders/shadow-pass.vert", "shaders/shadow-pass.frag");
    rs->shaders[SHADER_VISUALIZE_DEPTH] = shader_make(z, "shaders/visualize-depth.vert", "shaders/visualize-depth.frag");
    rs->shaders[SHADER_RENDER_MODEL] = shader_make(z, "shaders/model.vert", "shaders/model.frag");
    rs->shaders[SHADER_RENDER_MODEL_SHADOWED] = shader_make(z, "shaders/model-shadowed.vert", "shaders/model-shadowed.frag");

    rs->textures = safe_malloc(TEXTURE_COUNT * sizeof(texture *));
    rs->textures[TEXTURE_BARON] = texture_make(z, "textures/baron.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
    rs->textures[TEXTURE_GRASS] = texture_make(z, "textures/tiles/grass.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_PLANK_FLOOR] = texture_make(z, "textures/tiles/plank-floor.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_PLANKS] = texture_make(z, "textures/tiles/planks.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_STONE] = texture_make(z, "textures/tiles/stone.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_STONE_FLOOR] = texture_make(z, "textures/tiles/stone-floor.png", GL_REPEAT, GL_NEAREST);

    ss->music = safe_malloc(MUSIC_COUNT * sizeof(Mix_Music *));
    soundstate_load_music(ss, z, MUSIC_VAMPIRE_KILLER, "music/vampire-killer.wav");

    ss->sound = safe_malloc(SOUND_COUNT * sizeof(Mix_Chunk *));
    soundstate_load_sound(ss, z, SOUND_BARON_SCREAM, "sounds/baron-scream.wav");

    string *human_data = cat("models/human.model");
    wad_element *human_wad = parse_wad(human_data);
    string_free(human_data);
    string *human_str = wad_to_string(human_wad);
    printf("\nhuman %s\n", human_str);
    string_free(human_str);
    model *human_model = model_parse(human_wad, NULL);
    for (int i = 0; i < TEXTURE_COUNT; i++) {
        if (string_equal(human_model->texture, rs->textures[i]->path)) {
            human_model->texture_id = i;
            break;
        }
    }
    modelstate_add_model(ms, "human", human_model);
    delete_wad(human_wad);

    // soundstate_play_music(ss, MUSIC_VAMPIRE_KILLER);
    // soundstate_play_sound(ss, SOUND_BARON_SCREAM);

    if (use_zip) {
        zip_close(z);
    }
}

void wad_load_map(world *w, input *in, modelstate *ms) {

    place_flat(w);
    place_house(w, 10, 10);
    place_house(w, 40, 60);

    world_build_map(w);

    create_hero(in, w, 10, 40, modelstate_get_model(ms, "human"));
    create_baron(w, 8, 45, modelstate_get_model(ms, "human"));
}
