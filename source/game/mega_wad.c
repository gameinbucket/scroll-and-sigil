#include "mega_wad.h"

void mega_wad_load_resources(sound_system *ss, model_system *ms) {

    struct zip *z = NULL;
    const bool use_zip = false;

    if (use_zip) {
        z = open_zip_archive("scroll-and-sigil.pack");
    }

    // string *wad_data = cat("wads/wad");
    // wad_element *wad = parse_wad(wad_data);
    // string_free(wad_data);
    // string *wad_str = wad_to_string(wad);
    // printf("\nmega wad %s\n", wad_str);
    // string_free(wad_str);
    // delete_wad(wad);

    ss->music = safe_malloc(MUSIC_COUNT * sizeof(Mix_Music *));
    sound_system_load_music(ss, z, MUSIC_VAMPIRE_KILLER, "music/vampire-killer.wav");

    ss->sound = safe_malloc(SOUND_COUNT * sizeof(Mix_Chunk *));
    sound_system_load_sound(ss, z, SOUND_BARON_SCREAM, "sounds/baron-scream.wav");

    string *human_data = cat("models/human.wad");
    wad_element *human_wad = parse_wad(human_data);
    // string_free(human_data);
    // string *human_str = wad_to_string(human_wad);
    // printf("\nhuman %s\n", human_str);
    // string_free(human_str);

    string *human_animation_data = cat("models/animations/human.wad");
    wad_element *human_animation_wad = parse_wad(human_animation_data);
    string_free(human_animation_data);
    // string *human_animation_str = wad_to_string(human_animation_wad);
    // printf("\nhuman animation %s\n", human_animation_str);
    // string_free(human_animation_str);

    model_info *human_model = model_parse(human_wad, human_animation_wad);
    // for (int i = 0; i < TEXTURE_COUNT; i++) {
    //     if (string_equal(human_model->texture, rs->textures[i]->path)) {
    //         human_model->texture_id = i;
    //         break;
    //     }
    // }
    model_system_add_model(ms, "human", human_model);
    delete_wad(human_wad);

    string *baron_data = cat("entities/npc/baron.wad");
    wad_element *baron_wad = parse_wad(baron_data);
    string_free(baron_data);
    // string *baron_str = wad_to_string(baron_wad);
    // printf("\nbaron %s\n", baron_str);
    // string_free(baron_str);
    npc_parse(baron_wad);
    delete_wad(baron_wad);

    ss->mute = true;
    sound_system_play_music(ss, MUSIC_VAMPIRE_KILLER);
    sound_system_play_sound(ss, SOUND_BARON_SCREAM);

    if (use_zip) {
        zip_close(z);
    }

    printf("\n");
}

void mega_wad_load_map(world *w, input *in, model_system *ms) {

    place_flat(w);
    place_house(w, 10, 10);
    place_house(w, 40, 60);

    world_build_map(w);

    create_hero(in, w, 10, 40, model_system_get_model(ms, "human"));
    create_baron(w, 8, 45, model_system_get_model(ms, "human"));

    create_blood(w, 5, 1, 30);
    create_tree(w, 14, 42);
}
