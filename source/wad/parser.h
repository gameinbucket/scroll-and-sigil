#ifndef WAD_PARSER_H
#define WAD_PARSER_H

#include "assets/assets.h"
#include "core/archive.h"
#include "core/fileio.h"
#include "core/string_util.h"
#include "data/array.h"
#include "data/table.h"

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

wad_element *create_wad_object();
wad_element *create_wad_array();
wad_element *create_wad_string(string *value);

wad_object *wad_get_object(wad_element *element);
wad_array *wad_get_array(wad_element *element);
string *wad_get_string(wad_element *element);
int wad_get_integer(wad_element *element);
float wad_get_float(wad_element *element);
bool wad_get_bool(wad_element *element);

void wad_add_to_object(wad_element *element, char *key, wad_element *value);
wad_element *wad_get_from_object(wad_element *object, char *key);
wad_element *wad_get_required_from_object(wad_element *object, char *key);
wad_element *wad_get_from_array(wad_element *array, unsigned int index);
wad_element *wad_get_required_from_array(wad_element *array, unsigned int index);
table_iterator wad_object_iterator(wad_element *object);
unsigned int wad_get_size(wad_element *element);

void delete_wad(wad_element *element);
wad_element *parse_wad(string *str);

string *wad_to_string(wad_element *element);

#endif
