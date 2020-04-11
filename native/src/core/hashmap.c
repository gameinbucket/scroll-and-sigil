#include "hashmap.h"

uint64_t hashmap_uint64_max = (uint64_t)2000000;

int hashmap_string_hashcode(const char *key) {
    int pos = 0;
    uint64_t value = (uint64_t)0;
    int length = strlen(key);
    while ((value < hashmap_uint64_max && pos < length)) {
        value = (value << (uint64_t)8) + (uint64_t)key[pos];
        pos += 1;
    }
    return (int)value;
}

hashmap *hashmap_init(int (*code_function)(void *)) {
    hashmap *h = safe_malloc(sizeof(hashmap));
    h->size = 0;
    h->capacity = 12;
    h->code_function = code_function;
    h->table = slice_init(sizeof(hashmap_item *), 0, 12);
    return h;
}

int hashmap_get_bin(hashmap *self, int code) {
    return code % self->capacity;
}

void hashmap_put(hashmap *self, void *key, void *value) {
    int code = (*self->code_function)(key);
    int bin = hashmap_get_bin(self, code);
    hashmap_item *element = self->table[bin];
    hashmap_item *previous = NULL;
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
    hashmap_item *item = safe_malloc(sizeof(hashmap_item));
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

void *hashmap_get(hashmap *self, void *key) {
    int code = (*self->code_function)(key);
    int bin = hashmap_get_bin(self, code);
    hashmap_item *element = self->table[bin];
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

bool hashmap_has(hashmap *self, void *key) {
    return hashmap_get(self, key) != NULL;
}

void *hashmap_delete(hashmap *self, void *key) {
    int code = (*self->code_function)(key);
    int bin = hashmap_get_bin(self, code);
    hashmap_item *element = self->table[bin];
    hashmap_item *previous = NULL;
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

void hashmap_clear(hashmap *self) {
    int size = slice_len(self->table);
    for (int i = 0; i < size; i++) {
        self->table[i] = NULL;
    }
    self->size = 0;
}
