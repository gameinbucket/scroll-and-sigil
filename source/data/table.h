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

table *create_table(bool (*equals_fn)(void *, void *), unsigned long (*hashcode_fn)(void *));

void table_put(table *self, void *key, void *value);
void *table_get(table *self, void *key);
bool table_has(table *self, void *key);

void *table_remove(table *self, void *key);
void table_clear(table *self);

bool table_is_empty(table *self);
bool table_not_empty(table *self);
unsigned int table_size(table *self);

void release_table(table *self);
void delete_table(table *self);

typedef struct table_pair table_pair;

struct table_pair {
    void *key;
    void *value;
};

typedef struct table_iterator table_iterator;

struct table_iterator {
    table *pointer;
    unsigned int bin;
    table_item *item;
};

table_iterator create_table_iterator(table *self);
bool table_iterator_has_next(table_iterator *iter);
table_pair table_iterator_next(table_iterator *iter);

#endif
