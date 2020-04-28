#ifndef WAD_H
#define WAD_H

#include <zip.h>

#include "assets/assets.h"
#include "core/archive.h"
#include "core/file.h"
#include "core/string.h"
#include "data/array.h"
#include "data/table.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/texture.h"
#include "places/place.h"
#include "things/hero.h"
#include "world/world.h"
#include "world/worldbuild.h"

#include "renderstate.h"
#include "soundstate.h"

enum wad_type { WAD_OBJECT, WAD_ARRAY, WAD_STRING };

typedef enum wad_type wad_type;

typedef table wad_object;
typedef array wad_array;

typedef struct wad_element wad_element;

union wad_union {
    wad_object *object;
    wad_array *array;
    string *str;
};

struct wad_element {
    enum wad_type type;
    union wad_union value;
};

wad_element *new_wad_object();
wad_element *new_wad_array();
wad_element *new_wad_string(string *value);

wad_object *wad_get_object(wad_element *element);
wad_array *wad_get_array(wad_element *element);
string *wad_get_string(wad_element *element);

void wad_object_add(wad_element *element, string *key, wad_element *value);
wad_element *wad_object_get(wad_element *object, string *key);

void dealloc_wad(wad_element *element);
wad_element *parse_wad(string *str);

string *wad_to_string(wad_element *element);

void wad_load_resources(renderstate *rs, soundstate *ss);
void wad_load_map(input *in, world *w);

#endif
