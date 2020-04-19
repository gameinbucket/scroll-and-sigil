#ifndef TABLE_H
#define TABLE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdlib.h>

#include "core/mem.h"
#include "core/slice.h"

typedef struct table_item table_item;

struct table_item {
    uint64_t code;
    void *key;
    void *value;
    table_item *next;
};

typedef struct table table;

struct table {
    unsigned int size;
    unsigned int capacity;
    uint64_t (*hashcode_fn)(void *);
    table_item **table;
};

uint64_t table_address_hashcode(void *key);
uint64_t table_string_hashcode(void *key);

table *new_table(uint64_t (*hashcode_fn)(void *));

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
