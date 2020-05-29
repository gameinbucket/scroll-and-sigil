#include "parser.h"

wad_element *create_wad_object() {
    wad_element *e = safe_calloc(1, sizeof(wad_element));
    e->type = WAD_OBJECT;
    e->value.object = create_table(&table_string_equal, &table_string_hashcode);
    return e;
}

wad_element *create_wad_array() {
    wad_element *e = safe_calloc(1, sizeof(wad_element));
    e->type = WAD_ARRAY;
    e->value.array = create_array(0);
    return e;
}

wad_element *create_wad_string(string *value) {
    wad_element *e = safe_calloc(1, sizeof(wad_element));
    e->type = WAD_STRING;
    e->value.str = string_copy(value);
    return e;
}

wad_object *wad_get_object(wad_element *element) {
    if (element == NULL) {
        return NULL;
    }
    return element->value.object;
}

wad_array *wad_get_array(wad_element *element) {
    if (element == NULL) {
        return NULL;
    }
    return element->value.array;
}

string *wad_get_string(wad_element *element) {
    if (element == NULL) {
        return NULL;
    }
    return element->value.str;
}

int wad_get_integer(wad_element *element) {
    if (element == NULL) {
        return 0;
    }
    string *str = element->value.str;
    return string_to_int32(str);
}

float wad_get_float(wad_element *element) {
    if (element == NULL) {
        return 0.0f;
    }
    string *str = element->value.str;
    return string_to_float(str);
}

bool wad_get_bool(wad_element *element) {
    if (element == NULL) {
        return false;
    }
    string *str = element->value.str;
    return string_to_bool(str);
}

void wad_add_to_object(wad_element *object, char *key, wad_element *value) {
    table_put(wad_get_object(object), string_init(key), value);
}

wad_element *wad_get_from_object(wad_element *object, char *key) {
    return table_get(wad_get_object(object), key);
}

wad_element *wad_get_required_from_object(wad_element *object, char *key) {
    wad_element *element = wad_get_from_object(object, key);
    if (element == NULL) {
        fprintf(stderr, "Error: Wad key \"%s\" not found: %s\n", key, wad_to_string(object));
        exit(1);
    }
    return element;
}

wad_element *wad_get_from_array(wad_element *array, unsigned int index) {
    return array_get(wad_get_array(array), index);
}

wad_element *wad_get_required_from_array(wad_element *array, unsigned int index) {
    wad_element *element = wad_get_from_array(array, index);
    if (element == NULL) {
        fprintf(stderr, "Error: Wad index %d not found: %s\n", index, wad_to_string(array));
        exit(1);
    }
    return element;
}

table_iterator wad_object_iterator(wad_element *object) {
    return create_table_iterator(wad_get_object(object));
}

unsigned int wad_get_size(wad_element *element) {
    switch (element->type) {
    case WAD_OBJECT: return table_size(wad_get_object(element));
    case WAD_ARRAY: return array_size(wad_get_array(element));
    case WAD_STRING: return string_len(wad_get_string(element));
    }
    return 0;
}

void delete_wad(wad_element *element) {
    switch (element->type) {
    case WAD_OBJECT: delete_table(wad_get_object(element)); break;
    case WAD_ARRAY: delete_array(wad_get_array(element)); break;
    case WAD_STRING: string_free(wad_get_string(element)); break;
    }
    free(element);
}

static int parse_wad_skip_whitespace(string *str, size_t i) {
    i++;
    char c = str[i];
    if (c != '\n' && c != ' ') {
        return i - 1;
    }
    size_t len = string_len(str);
    do {
        i++;
        if (i == len) {
            return i;
        }
        c = str[i];
    } while (c == '\n' || c == ' ');
    return i - 1;
}

wad_element *parse_wad(string *str) {

    wad_element *wad = create_wad_object();

    array *stack = create_array(0);
    array_push(stack, wad);

    string *key = string_init("");
    string *value = string_init("");

    char pc = '\0';
    bool parsing_key = true;

    size_t len = string_len(str);

    for (size_t i = 0; i < len; i++) {
        char c = str[i];
        if (c == '\n') {
            if (parsing_key) {
            } else if (pc != '}' && pc != ']') {
                wad_element *head = stack->items[0];
                wad_element *child = create_wad_string(value);
                if (head->type == WAD_ARRAY) {
                    array_push(wad_get_array(head), child);
                } else {
                    wad_add_to_object(head, key, child);
                    string_zero(key);
                    parsing_key = true;
                }
                string_zero(value);
            }
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (c == ':') {
            parsing_key = false;
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (c == ',') {
            if (pc != '}' && pc != ']') {
                wad_element *head = stack->items[0];
                wad_element *child = create_wad_string(value);
                if (head->type == WAD_ARRAY) {
                    array_push(wad_get_array(head), child);
                } else {
                    wad_add_to_object(head, key, child);
                    string_zero(key);
                    parsing_key = true;
                }
                string_zero(value);
            }
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (c == '{') {
            wad_element *map = create_wad_object();
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                array_push(wad_get_array(head), map);
                parsing_key = true;
            } else {
                wad_add_to_object(head, key, map);
                string_zero(key);
            }
            array_insert(stack, 0, map);
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (c == '[') {
            wad_element *ls = create_wad_array();
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                array_push(wad_get_array(head), ls);
            } else {
                wad_add_to_object(head, key, ls);
                string_zero(key);
            }
            array_insert(stack, 0, ls);
            parsing_key = false;
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (c == '}') {
            if (pc != ',' && pc != ']' && pc != '{' && pc != '}' && pc != '\n') {
                wad_element *head = stack->items[0];
                wad_add_to_object(head, key, create_wad_string(value));
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
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (c == ']') {
            if (pc != ',' && pc != '}' && pc != '[' && pc != ']' && pc != '\n') {
                wad_element *head = stack->items[0];
                array_push(wad_get_array(head), create_wad_string(value));
                string_zero(value);
            }
            array_remove_index(stack, 0);
            wad_element *head = stack->items[0];
            if (head->type == WAD_ARRAY) {
                parsing_key = false;
            } else {
                parsing_key = true;
            }
            pc = c;
            i = parse_wad_skip_whitespace(str, i);
        } else if (parsing_key) {
            pc = c;
            key = string_append_char(key, c);
        } else {
            pc = c;
            value = string_append_char(value, c);
        }
    }

    if (pc != ',' && pc != ']' && pc != '}' && pc != '\n') {
        wad_element *head = stack->items[0];
        wad_add_to_object(head, key, create_wad_string(value));
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
        table_iterator iter = create_table_iterator(map);
        while (table_iterator_has_next(&iter)) {
            table_pair pair = table_iterator_next(&iter);
            string *in = wad_to_string(pair.value);
            str = string_append(str, pair.key);
            if (in[0] != '[' && in[0] != '{') {
                str = string_append(str, ":");
            }
            str = string_append(str, in);
            if (table_iterator_has_next(&iter)) {
                str = string_append(str, ",");
            }
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
            if (i < len - 1) {
                str = string_append(str, ",");
            }
            string_free(in);
        }
        str = string_append(str, "]");
        return str;
    }
    case WAD_STRING: return string_copy(wad_get_string(element));
    }
    return NULL;
}
