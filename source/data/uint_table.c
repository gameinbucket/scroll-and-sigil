#include "uint_table.h"

static const float LOAD_FACTOR = 0.80;

static const unsigned int INITIAL_BINS = 1 << 3;

static const unsigned int MAXIMUM_BINS = 1 << 30;

bool uint_table_address_equal(void *a, void *b) {
    return a == b;
}

unsigned long uint_table_address_hashcode(unsigned int key) {
    return (unsigned long)key;
}

uint_table *create_uint_table() {
    uint_table *self = safe_malloc(sizeof(uint_table));
    self->size = 0;
    self->bins = INITIAL_BINS;
    self->items = safe_calloc(self->bins, sizeof(uint_table_item *));
    return self;
}

static unsigned int get_bin(uint_table *self, unsigned long hash) {
    return (self->bins - 1) & hash;
}

static unsigned long hash_mix(unsigned int hash) {
    return hash ^ (hash >> 16);
}

static void resize(uint_table *self) {

    unsigned int old_bins = self->bins;
    unsigned int bins = old_bins << 1;

    if (bins > MAXIMUM_BINS) {
        return;
    }

    uint_table_item **old_items = self->items;
    uint_table_item **items = safe_calloc(bins, sizeof(uint_table_item *));

    for (unsigned int i = 0; i < old_bins; i++) {
        uint_table_item *item = old_items[i];
        if (item == NULL) {
            continue;
        }
        if (item->next == NULL) {
            items[(bins - 1) & item->hash] = item;
        } else {
            uint_table_item *low_head = NULL;
            uint_table_item *low_tail = NULL;
            uint_table_item *high_head = NULL;
            uint_table_item *high_tail = NULL;
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

void uint_table_put(uint_table *self, unsigned int key, void *value) {
    unsigned long hash = hash_mix(key);
    unsigned int bin = get_bin(self, hash);
    uint_table_item *item = self->items[bin];
    uint_table_item *previous = NULL;
    while (item != NULL) {
        if (key == item->key) {
            item->value = value;
            return;
        }
        previous = item;
        item = item->next;
    }
    item = safe_malloc(sizeof(uint_table_item));
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

void *uint_table_get(uint_table *self, unsigned int key) {
    unsigned long hash = hash_mix(key);
    unsigned int bin = get_bin(self, hash);
    uint_table_item *item = self->items[bin];
    while (item != NULL) {
        if (key == item->key) {
            return item->value;
        }
        item = item->next;
    }
    return NULL;
}

bool uint_table_has(uint_table *self, unsigned int key) {
    return uint_table_get(self, key) != NULL;
}

void *uint_table_remove(uint_table *self, unsigned int key) {
    unsigned long hash = hash_mix(key);
    unsigned int bin = get_bin(self, hash);
    uint_table_item *item = self->items[bin];
    uint_table_item *previous = NULL;
    while (item != NULL) {
        if (key == item->key) {
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

void uint_table_clear(uint_table *self) {
    unsigned int bins = self->bins;
    for (unsigned int i = 0; i < bins; i++) {
        uint_table_item *item = self->items[i];
        while (item != NULL) {
            uint_table_item *next = item->next;
            free(item);
            item = next;
        }
        self->items[i] = NULL;
    }
    self->size = 0;
}

bool uint_table_is_empty(uint_table *self) {
    return self->size == 0;
}

bool uint_table_not_empty(uint_table *self) {
    return self->size != 0;
}

unsigned int uint_table_size(uint_table *self) {
    return self->size;
}

void release_uint_table(uint_table *self) {
    uint_table_clear(self);
    free(self->items);
}

void delete_uint_table(uint_table *self) {
    release_uint_table(self);
    free(self);
}

uint_table_iterator create_uint_table_iterator(uint_table *self) {
    uint_table_iterator iter;
    iter.pointer = self;
    if (self->size == 0) {
        iter.bin = 0;
        iter.item = NULL;
    } else {
        unsigned int bins = self->bins;
        for (unsigned int i = 0; i < bins; i++) {
            uint_table_item *start = self->items[i];
            if (start) {
                iter.bin = i;
                iter.item = start;
                break;
            }
        }
    }
    return iter;
}

bool uint_table_iterator_has_next(uint_table_iterator *iter) {
    return iter->item;
}

uint_table_pair uint_table_iterator_next(uint_table_iterator *iter) {
    uint_table_item *item = iter->item;
    if (item == NULL) {
        return (uint_table_pair){0, NULL};
    }
    uint_table_pair pair = {item->key, item->value};
    item = item->next;
    if (item == NULL) {
        unsigned int bin = iter->bin;
        unsigned int stop = iter->pointer->bins;
        for (bin = bin + 1; bin < stop; bin++) {
            uint_table_item *start = iter->pointer->items[bin];
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
