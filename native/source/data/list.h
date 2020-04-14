#ifndef LIST_H
#define LIST_H

#include <stdbool.h>
#include <stdlib.h>

#include "core/mem.h"

typedef struct list list;

struct list {
    void *item;
    list *next;
};

list *list_init();
void list_add(list *self, void *item);
void list_push(list *self, void *item);
void list_remove(list *self, void *item);
void list_remove_index(list *self, unsigned int index);
void list_insert(list *self, unsigned int index, void *item);
void list_insert_sort(list *self, int (*compare)(void *, void *), void *item);
void *list_find(list *self, bool(find)(void *, void *), void *has);
void *list_get(list *self, unsigned int index);
bool list_is_empty(list *self);
bool list_not_empty(list *self);
unsigned int list_size(list *self);
void **list_to_array(list *self);
void list_free(list *self);

#endif
