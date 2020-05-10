#ifndef ARRAY_H
#define ARRAY_H

#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#include "core/mem.h"

typedef struct array array;

struct array {
    void **items;
    unsigned int length;
    unsigned int capacity;
};

bool find_address(void *item, void *has);

void array_init_with_capacity(array *self, unsigned int length, unsigned int capacity);
void array_init(array *self, unsigned int length);

array *create_array_with_capacity(unsigned int length, unsigned int capacity);
array *create_array(unsigned int length);
array *create_array_with_items(unsigned int length, unsigned int capacity, void **items);

void **array_copy_items(array *self);
array *create_array_copy(array *self);

void array_push(array *self, void *item);
void array_insert(array *self, unsigned int index, void *item);
void array_insert_sort(array *self, int (*compare)(void *, void *), void *item);

void *array_find(array *self, bool(find)(void *, void *), void *has);
void *array_get(array *self, unsigned int index);

void *array_pop(array *self);
void array_remove(array *self, void *item);
void array_remove_index(array *self, unsigned int index);

void array_clear(array *self);

bool array_is_empty(array *self);
bool array_not_empty(array *self);
unsigned int array_size(array *self);

void release_array(array *self);
void delete_array(array *self);

#endif
