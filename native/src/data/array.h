#ifndef ARRAY_H
#define ARRAY_H

#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#include "core/mem.h"

typedef struct array array;

struct array {
    void **items;
    size_t length;
    size_t capacity;
};

array *array_init_with_capacity(size_t length, size_t capacity);
array *array_init(size_t length);
array *array_init_with_items(size_t length, size_t capacity, void **items);
void array_push(array *self, void *item);
void array_insert(array *self, unsigned int index, void *item);
void *array_get(array *self, unsigned int index);
void *array_pop(array *self);
void array_remove(array *self, void *item);
void array_remove_index(array *self, unsigned int index);
void array_clear(array *self);
void array_free(array *self);

#endif
