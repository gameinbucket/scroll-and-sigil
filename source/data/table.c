#include "table.h"

uint64_t table_address_hashcode(void *key) {
    return (uint64_t)key;
}

uint64_t table_string_hashcode(void *key) {
    char *str_key = key;
    int pos = 0;
    int length = strlen(str_key);
    uint64_t value = 0;
    while (pos < length) {
        value = (value << (uint64_t)8) + (uint64_t)str_key[pos];
        pos += 1;
    }
    return value;
}

table *new_table(uint64_t (*hashcode_fn)(void *)) {
    table *h = safe_malloc(sizeof(table));
    h->size = 0;
    h->capacity = 12;
    h->hashcode_fn = hashcode_fn;
    h->table = slice_init(sizeof(table_item *), 0, 12);
    return h;
}

static int get_bin(table *self, uint64_t code) {
    return code % self->capacity;
}

void table_put(table *self, void *key, void *value) {
    uint64_t code = (*self->hashcode_fn)(key);
    int bin = get_bin(self, code);
    table_item *element = self->table[bin];
    table_item *previous = NULL;
    while (element != NULL) {
        if (code == element->code) {
            element->value = value;
            return;
        }
        previous = element;
        element = element->next;
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
    uint64_t code = (*self->hashcode_fn)(key);
    int bin = get_bin(self, code);
    table_item *element = self->table[bin];
    while (element != NULL) {
        if (code == element->code) {
            return element->value;
        }
        element = element->next;
    }
    return NULL;
}

bool table_has(table *self, void *key) {
    return table_get(self, key) != NULL;
}

void *table_remove(table *self, void *key) {
    uint64_t code = (*self->hashcode_fn)(key);
    int bin = get_bin(self, code);
    table_item *element = self->table[bin];
    table_item *previous = NULL;
    while (element != NULL) {
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
    return NULL;
}

void table_clear(table *self) {
    int size = slice_len(self->table);
    for (int i = 0; i < size; i++) {
        self->table[i] = NULL;
    }
    self->size = 0;
}

bool table_is_empty(table *self) {
    return self->size == 0;
}

bool table_not_empty(table *self) {
    return self->size != 0;
}

unsigned int table_size(table *self) {
    return self->size;
}

void release_table(table *self) {
    free(self->table);
}

void destroy_table(table *self) {
    release_table(self);
    free(self);
}
