#include "set.h"

static const float LOAD_FACTOR = 0.80;

static const unsigned int INITIAL_BINS = 1 << 3;

static const unsigned int MAXIMUM_BINS = 1 << 30;

bool set_string_equal(void *a, void *b) {
    return strcmp(a, b) == 0;
}

unsigned long set_string_hashcode(void *key) {
    char *str_key = key;
    int length = strlen(str_key);
    unsigned long hash = 0;
    for (int i = 0; i < length; i++) {
        hash = 31 * hash + (unsigned long)str_key[i];
    }
    return hash;
}

bool set_address_equal(void *a, void *b) {
    return a == b;
}

unsigned long set_address_hashcode(void *key) {
    return (unsigned long)key;
}

set *create_set(bool (*equals_fn)(void *, void *), unsigned long (*hashcode_fn)(void *)) {
    set *self = safe_malloc(sizeof(set));
    self->equals_fn = equals_fn;
    self->hashcode_fn = hashcode_fn;
    self->size = 0;
    self->bins = INITIAL_BINS;
    self->items = safe_calloc(self->bins, sizeof(set_item *));
    return self;
}

static unsigned int get_bin(set *self, unsigned long hash) {
    return (self->bins - 1) & hash;
}

static unsigned long hash_mix(unsigned long hash) {
    return hash ^ (hash >> 16);
}

static void resize(set *self) {

    unsigned int old_bins = self->bins;
    unsigned int bins = old_bins << 1;

    if (bins > MAXIMUM_BINS) {
        return;
    }

    set_item **old_items = self->items;
    set_item **items = safe_calloc(bins, sizeof(set_item *));

    for (unsigned int i = 0; i < old_bins; i++) {
        set_item *item = old_items[i];
        if (item == NULL) {
            continue;
        }
        if (item->next == NULL) {
            items[(bins - 1) & item->hash] = item;
        } else {
            set_item *low_head = NULL;
            set_item *low_tail = NULL;
            set_item *high_head = NULL;
            set_item *high_tail = NULL;
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

void set_add(set *self, void *key) {
    unsigned long hash = hash_mix((*self->hashcode_fn)(key));
    unsigned int bin = get_bin(self, hash);
    set_item *item = self->items[bin];
    set_item *previous = NULL;
    while (item != NULL) {
        if (hash == item->hash && self->equals_fn(key, item->key)) {
            return;
        }
        previous = item;
        item = item->next;
    }
    item = safe_malloc(sizeof(set_item));
    item->hash = hash;
    item->key = key;
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

bool set_has(set *self, void *key) {
    unsigned long hash = hash_mix((*self->hashcode_fn)(key));
    unsigned int bin = get_bin(self, hash);
    set_item *item = self->items[bin];
    while (item != NULL) {
        if (hash == item->hash && self->equals_fn(key, item->key)) {
            return true;
        }
        item = item->next;
    }
    return false;
}

void set_remove(set *self, void *key) {
    unsigned long hash = hash_mix((*self->hashcode_fn)(key));
    unsigned int bin = get_bin(self, hash);
    set_item *item = self->items[bin];
    set_item *previous = NULL;
    while (item != NULL) {
        if (hash == item->hash && self->equals_fn(key, item->key)) {
            if (previous == NULL) {
                self->items[bin] = item->next;
            } else {
                previous->next = item->next;
            }
            self->size -= 1;
            return;
        }
        previous = item;
        item = item->next;
    }
}

void set_clear(set *self) {
    unsigned int bins = self->bins;
    for (unsigned int i = 0; i < bins; i++) {
        set_item *item = self->items[i];
        while (item != NULL) {
            set_item *next = item->next;
            free(item);
            item = next;
        }
        self->items[i] = NULL;
    }
    self->size = 0;
}

bool set_is_empty(set *self) {
    return self->size == 0;
}

bool set_not_empty(set *self) {
    return self->size != 0;
}

unsigned int set_size(set *self) {
    return self->size;
}

void release_set(set *self) {
    set_clear(self);
    free(self->items);
}

void delete_set(set *self) {
    release_set(self);
    free(self);
}

set_iterator create_set_iterator(set *self) {
    set_iterator iter;
    iter.pointer = self;
    if (self->size == 0) {
        iter.bin = 0;
        iter.item = NULL;
    } else {
        unsigned int bins = self->bins;
        for (unsigned int i = 0; i < bins; i++) {
            set_item *start = self->items[i];
            if (start) {
                iter.bin = i;
                iter.item = start;
                break;
            }
        }
    }
    return iter;
}

bool set_iterator_has_next(set_iterator *iter) {
    return iter->item;
}

void *set_iterator_next(set_iterator *iter) {
    set_item *item = iter->item;
    if (item == NULL) {
        return NULL;
    }
    void *key = item->key;
    item = item->next;
    if (item == NULL) {
        unsigned int bin = iter->bin;
        unsigned int stop = iter->pointer->bins;
        for (bin = bin + 1; bin < stop; bin++) {
            set_item *start = iter->pointer->items[bin];
            if (start) {
                item = start;
                break;
            }
        }
        iter->bin = bin;
    }
    iter->item = item;
    return key;
}
