#include "set.h"

uint64_t set_uint64_max = (uint64_t)2000000;

int set_string_hashcode(const char *key) {
    int pos = 0;
    uint64_t value = (uint64_t)0;
    int length = strlen(key);
    while ((value < set_uint64_max && pos < length)) {
        value = (value << (uint64_t)8) + (uint64_t)key[pos];
        pos += 1;
    }
    return (int)value;
}

set *set_init(int (*code_function)(void *)) {
    set *h = safe_malloc(sizeof(set));
    h->size = 0;
    h->capacity = 12;
    h->code_function = code_function;
    h->table = slice_init(sizeof(set_item *), 0, 12);
    return h;
}

int set_get_bin(set *self, int code) {
    return code % self->capacity;
}

void set_put(set *self, void *key, void *value) {
    int code = (*self->code_function)(key);
    int bin = set_get_bin(self, code);
    set_item *element = self->table[bin];
    set_item *previous = NULL;
    while (true) {
        if (element == NULL) {
            break;
        } else {
            if (code == element->code) {
                element->value = value;
                return;
            }
            previous = element;
            element = element->next;
        }
    }
    set_item *item = safe_malloc(sizeof(set_item));
    item->code = code;
    item->key = key;
    item->value = value;
    item->next = NULL;
    if (previous == NULL) {
        self->table[bin] = item;
    } else {
        previous->next = item;
    }
    self->size += 1;
}

void *set_get(set *self, void *key) {
    int code = (*self->code_function)(key);
    int bin = set_get_bin(self, code);
    set_item *element = self->table[bin];
    while (true) {
        if (element == NULL) {
            break;
        } else {
            if (code == element->code) {
                return element->value;
            }
            element = element->next;
        }
    }
    return NULL;
}

bool set_has(set *self, void *key) {
    return set_get(self, key) != NULL;
}

void *set_delete(set *self, void *key) {
    int code = (*self->code_function)(key);
    int bin = set_get_bin(self, code);
    set_item *element = self->table[bin];
    set_item *previous = NULL;
    while (true) {
        if (element == NULL) {
            break;
        } else {
            if (code == element->code) {
                if (previous == NULL) {
                    self->table[bin] = element->next;
                } else {
                    previous->next = element->next;
                }
                self->size -= 1;
                return element->value;
            }
            previous = element;
            element = element->next;
        }
    }
    return NULL;
}

void set_clear(set *self) {
    int size = slice_len(self->table);
    for (int i = 0; i < size; i++) {
        self->table[i] = NULL;
    }
    self->size = 0;
}
