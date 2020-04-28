#include "wad.h"

static bool wad_equal(void *a, void *b) {
    return a == b;
}

static unsigned long wad_hash(void *key) {
    return (unsigned long)key;
}

wad_element *new_wad_object() {
    wad_element *e = safe_calloc(1, sizeof(wad_element));
    e->type = WAD_OBJECT;
    e->value.object = new_table(&wad_equal, &wad_hash);
    return e;
}

wad_element *new_wad_array() {
    wad_element *e = safe_calloc(1, sizeof(wad_element));
    e->type = WAD_ARRAY;
    e->value.array = new_array(0);
    return e;
}

wad_element *new_wad_string(string *value) {
    wad_element *e = safe_calloc(1, sizeof(wad_element));
    e->type = WAD_STRING;
    e->value.str = string_copy(value);
    return e;
}

wad_object *wad_get_object(wad_element *element) {
    return element->value.object;
}

wad_array *wad_get_array(wad_element *element) {
    return element->value.array;
}

string *wad_get_string(wad_element *element) {
    return element->value.str;
}

void wad_object_add(wad_element *object, string *key, wad_element *value) {
    table_put(wad_get_object(object), string_copy(key), value);
}

wad_element *wad_object_get(wad_element *object, string *key) {
    return table_get(wad_get_object(object), key);
}

void dealloc_wad(wad_element *element) {
    switch (element->type) {
    case WAD_OBJECT: destroy_table(wad_get_object(element)); break;
    case WAD_ARRAY: destroy_array(wad_get_array(element)); break;
    case WAD_STRING: string_free(wad_get_string(element)); break;
    }
    free(element);
}

wad_element *parse_wad(string *str) {

    wad_element *wad = new_wad_object();

    array *stack = new_array(0);
    array_push(stack, wad);

    string *key = string_init("");
    string *value = string_init("");

    bool parsing_key = true;

    int len = string_len(str);

    for (int i = 0; i < len; i++) {
        char c = str[i];
        if (c == ':') {
            parsing_key = false;
        } else if (c == ',') {
            char pc = str[i - 1];
            if (pc != '}' && pc != ']') {
                wad_element *head = stack->items[0];
                wad_element *child = new_wad_string(value);
                if (head->type == WAD_ARRAY) {
                    array_push(wad_get_array(head), child);
                } else {
                    wad_object_add(head, key, child);
                    string_zero(key);
                    parsing_key = true;
                }
                string_zero(value);
            }
        } else if (c == '{') {
            wad_element *map = new_wad_object();
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                array_push(wad_get_array(head), map);
                parsing_key = true;
            } else {
                wad_object_add(head, key, map);
                string_zero(key);
            }
            array_insert(stack, 0, map);
        } else if (c == '[') {
            wad_element *ls = new_wad_array();
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                array_push(wad_get_array(head), ls);
            } else {
                wad_object_add(head, key, ls);
                string_zero(key);
            }
            array_insert(stack, 0, ls);
            parsing_key = false;
        } else if (c == '}') {
            char pc = str[i - 1];
            if (pc != ',' && pc != ']' && pc != '{' && pc != '}') {
                wad_element *head = stack->items[0];
                wad_object_add(head, key, new_wad_string(value));
                string_zero(key);
                string_zero(value);
            }
            array_remove_index(stack, 0);
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                parsing_key = false;
            } else {
                parsing_key = true;
            }
        } else if (c == ']') {
            char pc = str[i - 1];
            if (pc != ',' && pc != '}' && pc != '[' && pc != ']') {
                wad_element *head = stack->items[0];
                array_push(wad_get_array(head), new_wad_string(value));
                string_zero(value);
            }
            array_remove_index(stack, 0);
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                parsing_key = false;
            } else {
                parsing_key = true;
            }
        } else if (parsing_key) {
            key = string_append_char(key, c);
        } else {
            value = string_append_char(value, c);
        }
    }

    char pc = str[len - 1];
    if (pc != ',' && pc != ']' && pc != '}') {
        wad_element *head = stack->items[0];
        wad_object_add(head, key, new_wad_string(value));
    }

    string_free(key);
    string_free(value);

    return wad;
}

string *wad_to_string(wad_element *element) {
    switch (element->type) {
    case WAD_OBJECT: {
        wad_object *map = wad_get_object(element);
        string *str = string_init("{");
        table_iterator iter = new_table_iterator(map);
        while (table_iterator_has_next(&iter)) {
            table_pair pair = table_iterator_next(&iter);
            string *in = wad_to_string(pair.value);
            str = string_append(str, pair.key);
            str = string_append(str, ":");
            str = string_append(str, in);
            str = string_append(str, ",");
            string_free(in);
        }
        str = string_append(str, "}");
        return str;
    }
    case WAD_ARRAY: {
        wad_array *ls = wad_get_array(element);
        string *str = string_init("[");
        unsigned int len = ls->length;
        for (unsigned int i = 0; i < len; i++) {
            string *in = wad_to_string(ls->items[i]);
            str = string_append(str, in);
            str = string_append(str, ",");
            string_free(in);
        }
        str = string_append(str, "]");
        return str;
    }
    case WAD_STRING: return string_copy(wad_get_string(element));
    }
    return NULL;
}

void wad_load_resources(renderstate *rs, soundstate *ss) {

    struct zip *z = NULL;
    const bool use_zip = false;

    if (use_zip) {
        z = open_zip_archive("scroll-and-sigil.wad");
    }

    string *wad_data = cat("wads/wad");

    wad_element *wad = parse_wad(wad_data);
    string_free(wad_data);

    string *wad_str = wad_to_string(wad);
    printf("\nWAD: %c\n", wad_str[0]);
    string_free(wad_str);

    rs->shaders = safe_malloc(SHADER_COUNT * sizeof(shader *));
    rs->shaders[SHADER_SCREEN] = shader_make(z, "shaders/screen.vert", "shaders/screen.frag");
    rs->shaders[SHADER_TEXTURE_2D] = shader_make(z, "shaders/texture2d.vert", "shaders/texture2d.frag");
    rs->shaders[SHADER_TEXTURE_3D] = shader_make(z, "shaders/texture3d.vert", "shaders/texture3d.frag");
    rs->shaders[SHADER_TEXTURE_3D_COLOR] = shader_make(z, "shaders/texture3d-color.vert", "shaders/texture3d-color.frag");
    rs->shaders[SHADER_TEXTURE_3D_SHADOW] = shader_make(z, "shaders/texture3d-shadow.vert", "shaders/texture3d-shadow.frag");
    rs->shaders[SHADER_SHADOW_PASS] = shader_make(z, "shaders/shadow-pass.vert", "shaders/shadow-pass.frag");
    rs->shaders[SHADER_VISUALIZE_DEPTH] = shader_make(z, "shaders/visualize-depth.vert", "shaders/visualize-depth.frag");

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

    // soundstate_play_music(ss, MUSIC_VAMPIRE_KILLER);
    // soundstate_play_sound(ss, SOUND_BARON_SCREAM);

    dealloc_wad(wad);
    zip_close(z);
}

void wad_load_map(input *in, world *w) {

    place_flat(w);
    place_house(w, 10, 10);
    place_house(w, 40, 60);

    world_build_map(w);

    hero_init(in, w);
}
