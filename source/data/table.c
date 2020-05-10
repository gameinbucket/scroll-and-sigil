#include "table.h"

static const float LOAD_FACTOR = 0.80;

static const unsigned int INITIAL_BINS = 1 << 3;

static const unsigned int MAXIMUM_BINS = 1 << 30;

bool table_string_equal(void *a, void *b) {
    return strcmp(a, b) == 0;
}

unsigned long table_string_hashcode(void *key) {
    char *str_key = key;
    int length = strlen(str_key);
    unsigned long hash = 0;
    for (int i = 0; i < length; i++) {
        hash = 31 * hash + (unsigned long)str_key[i];
    }
    return hash;
}

bool table_address_equal(void *a, void *b) {
    return a == b;
}

unsigned long table_address_hashcode(void *key) {
    return (unsigned long)key;
}

table *create_table(bool (*equals_fn)(void *, void *), unsigned long (*hashcode_fn)(void *)) {
    table *self = safe_malloc(sizeof(table));
    self->equals_fn = equals_fn;
    self->hashcode_fn = hashcode_fn;
    self->size = 0;
    self->bins = INITIAL_BINS;
    self->items = safe_calloc(self->bins, sizeof(table_item *));
    return self;
}

static unsigned int get_bin(table *self, unsigned long hash) {
    return (self->bins - 1) & hash;
}

static unsigned long hash_mix(unsigned long hash) {
    return hash ^ (hash >> 16);
}

static void resize(table *self) {

    unsigned int old_bins = self->bins;
    unsigned int bins = old_bins << 1;

    if (bins > MAXIMUM_BINS) {
        return;
    }

    table_item **old_items = self->items;
    table_item **items = safe_calloc(bins, sizeof(table_item *));

    for (unsigned int i = 0; i < old_bins; i++) {
        table_item *item = old_items[i];
        if (item == NULL) {
            continue;
        }
        if (item->next == NULL) {
            items[(bins - 1) & item->hash] = item;
        } else {
            table_item *low_head = NULL;
            table_item *low_tail = NULL;
            table_item *high_head = NULL;
            table_item *high_tail = NULL;
            do {
                if ((old_bins & item->hash) == 0) {
                    if (low_tail == NULL) {
                        low_head = item;
                    } else {
                        low_tail->next = item;
                    }
                    low_tail = item;
                } else {
                    if (high_tail == NULL) {
                        high_head = item;
                    } else {
                        high_tail->next = item;
                    }
                    high_tail = item;
                }
                item = item->next;
            } while (item != NULL);

            if (low_tail != NULL) {
                low_tail->next = NULL;
                items[i] = low_head;
            }

            if (high_tail != NULL) {
                high_tail->next = NULL;
                items[i + old_bins] = high_head;
            }
        }
    }

    free(old_items);

    self->bins = bins;
    self->items = items;
}

void table_put(table *self, void *key, void *value) {
    unsigned long hash = hash_mix((*self->hashcode_fn)(key));
    unsigned int bin = get_bin(self, hash);
    table_item *item = self->items[bin];
    table_item *previous = NULL;
    while (item != NULL) {
        if (hash == item->hash && self->equals_fn(key, item->key)) {
            item->value = value;
            return;
        }
        previous = item;
        item = item->next;
    }
    item = safe_malloc(sizeof(table_item));
    item->hash = hash;
    item->key = key;
    item->value = value;
    item->next = NULL;
    if (previous == NULL) {
        self->items[bin] = item;
    } else {
        previous->next = item;
    }
    self->size++;
    if (self->size >= self->bins * LOAD_FACTOR) {
        resize(self);
    }
}

void *table_get(table *self, void *key) {
    unsigned long hash = hash_mix((*self->hashcode_fn)(key));
    unsigned int bin = get_bin(self, hash);
    table_item *item = self->items[bin];
    while (item != NULL) {
        if (hash == item->hash && self->equals_fn(key, item->key)) {
            return item->value;
        }
        item = item->next;
    }
    return NULL;
}

bool table_has(table *self, void *key) {
    return table_get(self, key) != NULL;
}

void *table_remove(table *self, void *key) {
    unsigned long hash = hash_mix((*self->hashcode_fn)(key));
    unsigned int bin = get_bin(self, hash);
    table_item *item = self->items[bin];
    table_item *previous = NULL;
    while (item != NULL) {
        if (hash == item->hash && self->equals_fn(key, item->key)) {
            if (previous == NULL) {
                self->items[bin] = item->next;
            } else {
                previous->next = item->next;
            }
            self->size -= 1;
            return item->value;
        }
        previous = item;
        item = item->next;
    }
    return NULL;
}

void table_clear(table *self) {
    unsigned int bins = self->bins;
    for (unsigned int i = 0; i < bins; i++) {
        table_item *item = self->items[i];
        while (item != NULL) {
            table_item *next = item->next;
            free(item);
            item = next;
        }
        self->items[i] = NULL;
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
    table_clear(self);
    free(self->items);
}

void delete_table(table *self) {
    release_table(self);
    free(self);
}

table_iterator create_table_iterator(table *self) {
    table_iterator iter;
    iter.pointer = self;
    if (self->size == 0) {
        iter.bin = 0;
        iter.item = NULL;
    } else {
        unsigned int bins = self->bins;
        for (unsigned int i = 0; i < bins; i++) {
            table_item *start = self->items[i];
            if (start) {
                iter.bin = i;
                iter.item = start;
                break;
            }
        }
    }
    return iter;
}

bool table_iterator_has_next(table_iterator *iter) {
    return iter->item;
}

table_pair table_iterator_next(table_iterator *iter) {
    table_item *item = iter->item;
    if (item == NULL) {
        return (table_pair){NULL, NULL};
    }
    table_pair pair = {item->key, item->value};
    item = item->next;
    if (item == NULL) {
        unsigned int bin = iter->bin;
        unsigned int stop = iter->pointer->bins;
        for (bin = bin + 1; bin < stop; bin++) {
            table_item *start = iter->pointer->items[bin];
            if (start) {
                item = start;
                break;
            }
        }
        iter->bin = bin;
    }
    iter->item = item;
    return pair;
}
