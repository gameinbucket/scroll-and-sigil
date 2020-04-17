#include "table.h"

uint64_t table_uint64_max = (uint64_t)2000000;

int table_string_hashcode(const char *key) {
    int pos = 0;
    uint64_t value = (uint64_t)0;
    int length = strlen(key);
    while ((value < table_uint64_max && pos < length)) {
        value = (value << (uint64_t)8) + (uint64_t)key[pos];
        pos += 1;
    }
    return (int)value;
}

table *table_init(int (*code_function)(void *)) {
    table *h = safe_malloc(sizeof(table));
    h->size = 0;
    h->capacity = 12;
    h->code_function = code_function;
    h->table = slice_init(sizeof(table_item *), 0, 12);
    return h;
}

int table_get_bin(table *self, int code) {
    return code % self->capacity;
}

void table_put(table *self, void *key, void *value) {
    int code = (*self->code_function)(key);
    int bin = table_get_bin(self, code);
    table_item *element = self->table[bin];
    table_item *previous = NULL;
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
    table_item *item = safe_malloc(sizeof(table_item));
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

void *table_get(table *self, void *key) {
    int code = (*self->code_function)(key);
    int bin = table_get_bin(self, code);
    table_item *element = self->table[bin];
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

bool table_has(table *self, void *key) {
    return table_get(self, key) != NULL;
}

void *table_delete(table *self, void *key) {
    int code = (*self->code_function)(key);
    int bin = table_get_bin(self, code);
    table_item *element = self->table[bin];
    table_item *previous = NULL;
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

void table_clear(table *self) {
    int size = slice_len(self->table);
    for (int i = 0; i < size; i++) {
        self->table[i] = NULL;
    }
    self->size = 0;
}
