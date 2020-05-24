#include "mega_wad.h"

void wad_load_resources(renderstate *rs, soundstate *ss, modelstate *ms) {

    struct zip *z = NULL;
    const bool use_zip = false;

    if (use_zip) {
        z = open_zip_archive("scroll-and-sigil.pack");
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
    rs->shaders[SHADER_RENDER_MODEL_SHADOWED] = shader_make(z, "shaders/model-shadowed.vert", "shaders/texture3d-shadowed.frag");
    rs->shaders[SHADER_HORIZONTAL_BLUR] = shader_make(z, "shaders/screen.vert", "shaders/horizontal-blur.frag");
    rs->shaders[SHADER_VERTICAL_BLUR] = shader_make(z, "shaders/screen.vert", "shaders/vertical-blur.frag");
    rs->shaders[SHADER_SSAO] = shader_make(z, "shaders/screen.vert", "shaders/ssao.frag");
    rs->shaders[SHADER_GBUFFER] = shader_make(z, "shaders/gbuffer.vert", "shaders/gbuffer.frag");
    rs->shaders[SHADER_RENDER_MODEL_GBUFFER] = shader_make(z, "shaders/model-gbuffer.vert", "shaders/gbuffer.frag");
    rs->shaders[SHADER_SSAO_BLUR] = shader_make(z, "shaders/screen.vert", "shaders/ssao-blur.frag");
    rs->shaders[SHADER_LIGHTING] = shader_make(z, "shaders/screen.vert", "shaders/lighting.frag");
    rs->shaders[SHADER_MODEL_SHADOW_PASS] = shader_make(z, "shaders/model-shadow-pass.vert", "shaders/model-shadow-pass.frag");
    rs->shaders[SHADER_TEXTURE_2D_COLOR] = shader_make(z, "shaders/texture2d-color.vert", "shaders/texture2d-color.frag");

    rs->textures = safe_malloc(TEXTURE_COUNT * sizeof(texture *));
    rs->textures[TEXTURE_BARON] = texture_make(z, "textures/baron.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
    rs->textures[TEXTURE_GRASS] = texture_make(z, "textures/tiles/grass.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_PLANK_FLOOR] = texture_make(z, "textures/tiles/plank-floor.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_PLANKS] = texture_make(z, "textures/tiles/planks.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_STONE] = texture_make(z, "textures/tiles/stone.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_STONE_FLOOR] = texture_make(z, "textures/tiles/stone-floor.png", GL_REPEAT, GL_NEAREST);
    rs->textures[TEXTURE_PARTICLES] = texture_make(z, "textures/particles.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
    rs->textures[TEXTURE_SCENERY] = texture_make(z, "textures/scenery.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
    rs->textures[TEXTURE_FONT] = texture_make(z, "textures/font.png", GL_CLAMP_TO_EDGE, GL_NEAREST);

    ss->music = safe_malloc(MUSIC_COUNT * sizeof(Mix_Music *));
    soundstate_load_music(ss, z, MUSIC_VAMPIRE_KILLER, "music/vampire-killer.wav");

    ss->sound = safe_malloc(SOUND_COUNT * sizeof(Mix_Chunk *));
    soundstate_load_sound(ss, z, SOUND_BARON_SCREAM, "sounds/baron-scream.wav");

    string *human_data = cat("models/human.wad");
    wad_element *human_wad = parse_wad(human_data);
    string_free(human_data);
    string *human_str = wad_to_string(human_wad);
    printf("\nhuman %s\n", human_str);
    string_free(human_str);

    string *human_animation_data = cat("models/animations/human.wad");
    wad_element *human_animation_wad = parse_wad(human_animation_data);
    string_free(human_animation_data);
    string *human_animation_str = wad_to_string(human_animation_wad);
    printf("\nhuman animation %s\n", human_animation_str);
    string_free(human_animation_str);

    model_info *human_model = model_parse(human_wad, human_animation_wad);
    for (int i = 0; i < TEXTURE_COUNT; i++) {
        if (string_equal(human_model->texture, rs->textures[i]->path)) {
            human_model->texture_id = i;
            break;
        }
    }
    modelstate_add_model(ms, "human", human_model);
    delete_wad(human_wad);

    string *baron_data = cat("entities/npc/baron.wad");
    wad_element *baron_wad = parse_wad(baron_data);
    string_free(baron_data);
    string *baron_str = wad_to_string(baron_wad);
    printf("\nbaron %s\n", baron_str);
    string_free(baron_str);
    npc_parse(baron_wad);
    delete_wad(baron_wad);

    // soundstate_play_music(ss, MUSIC_VAMPIRE_KILLER);
    // soundstate_play_sound(ss, SOUND_BARON_SCREAM);

    if (use_zip) {
        zip_close(z);
    }

    printf("\n");
}

void wad_load_map(world *w, input *in, modelstate *ms) {

    place_flat(w);
    place_house(w, 10, 10);
    place_house(w, 40, 60);

    world_build_map(w);

    create_hero(in, w, 10, 40, modelstate_get_model(ms, "human"));
    create_baron(w, 8, 45, modelstate_get_model(ms, "human"));

    create_blood(w, 5, 1, 30);
    create_tree(w, 14, 42);
}
