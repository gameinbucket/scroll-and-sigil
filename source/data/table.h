#ifndef TABLE_H
#define TABLE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdlib.h>

#include "core/mem.h"

typedef struct table_item table_item;

struct table_item {
    unsigned long hash;
    void *key;
    void *value;
    table_item *next;
};

typedef struct table table;

struct table {
    bool (*equals_fn)(void *, void *);
    unsigned long (*hashcode_fn)(void *);
    unsigned int size;
    unsigned int bins;
    table_item **items;
};

bool table_string_equal(void *a, void *b);
unsigned long table_string_hashcode(void *key);

bool table_address_equal(void *a, void *b);
unsigned long table_address_hashcode(void *key);

table *new_table(bool (*equals_fn)(void *, void *), unsigned long (*hashcode_fn)(void *));

void table_put(table *self, void *key, void *value);
void *table_get(table *self, void *key);
bool table_has(table *self, void *key);

void *table_remove(table *self, void *key);
void table_clear(table *self);

bool table_is_empty(table *self);
bool table_not_empty(table *self);
unsigned int table_size(table *self);

void release_table(table *self);
void destroy_table(table *self);

#endif
