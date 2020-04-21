#include "wad.h"

enum wad_type { WAD_OBJECT, WAD_ARRAY, WAD_VALUE };

struct wad_element;

typedef table wad_object;
typedef struct wad_element wad_element;

union wad_union {
    wad_object *object;
    wad_element *array;
    string *str;
};

struct wad_element {
    enum wad_type type;
    union wad_union value;
};

static wad_object *parse_wad(string *str) {
    wad_object *wad = parse_wad(str);

    array *stack = new_array(0);
    array_insert(stack, 0, wad);

    string *key = string_init("");
    string *value = string_init("");

    const bool is_parsing_key = true;
    bool state = is_parsing_key;

    int len = string_len(str);

    for (int i = 0; i < len; i++) {
        char c = str[i];
        if (c == ':') {
            state = !is_parsing_key;
        } else if (c == ',') {
            char pc = str[i - 1];
            if (pc != '}' && pc != ']') {
                wad_object *head = stack->items[0];
            }
        } else if (c == '{') {
        } else if (c == '[') {
        } else if (c == '}') {
        } else if (c == ']') {
        } else if (state == is_parsing_key) {
            key = string_append_char(key, c);
        } else {
            value = string_append_char(value, c);
        }
    }

    char pc = str[len - 1];
    if (pc != ',' && pc != ']' && pc != '}') {
        wad_object *head = stack->items[0];
        wad_element *element = safe_calloc(1, sizeof(wad_element));
        element->type = WAD_VALUE;
        element->value.str = value;
        table_put(head, key, value);
    }

    return wad;
}

void wad_load_resources(renderstate *rs) {

#ifdef WAD_USE_ZIP
    int err = 0;
    zip *z = zip_open("scroll-and-sigil.wad", 0, &err);

    const char *name = "shaders/screen.vert";
    struct zip_stat st;
    zip_stat_init(&st);
    zip_stat(z, name, 0, &st);

    char *contents = new char[st.size];

    zip_file *f = zip_fopen(z, name, 0);
    zip_fread(f, contents, st.size);
    zip_fclose(f);

    zip_close(z);
#endif

    string *wad_data = cat("wads/wad");
    printf("\n%s\n", wad_data);

    wad_object *wad = parse_wad(wad_data);
    string_free(wad_data);

    printf("\n%p\n", wad);

    // table *sprites = new_table(&table_string_equal, &table_string_hashcode);

    rs->shaders = safe_malloc(4 * sizeof(shader *));
    rs->shaders[SHADER_SCREEN] = shader_make("shaders/screen.vert", "shaders/screen.frag");
    rs->shaders[SHADER_TEXTURE_2D] = shader_make("shaders/texture2d.vert", "shaders/texture2d.frag");
    rs->shaders[SHADER_TEXTURE_3D] = shader_make("shaders/texture3d.vert", "shaders/texture3d.frag");
    rs->shaders[SHADER_TEXTURE_3D_COLOR] = shader_make("shaders/texture3d-color.vert", "shaders/texture3d-color.frag");

    rs->textures = safe_malloc(2 * sizeof(texture *));
    rs->textures[TEXTURE_BARON] = texture_make("textures/baron.png", GL_CLAMP_TO_EDGE, GL_NEAREST);
    rs->textures[TEXTURE_PLANK] = texture_make("textures/tiles/plank-floor.png", GL_REPEAT, GL_NEAREST);
}

void wad_load_map(renderstate *rs, world *w) {

    place_flat(rs, w);
    place_house(rs, w, 10, 10);
    place_house(rs, w, 40, 60);

    hero *h = hero_init();
    world_add_thing(w, &h->super);
}
