#ifndef TABLE_H
#define TABLE_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdlib.h>

#include "core/mem.h"
#include "core/slice.h"

extern uint64_t table_uint64_max;

typedef struct table_item table_item;

struct table_item {
    int code;
    void *key;
    void *value;
    struct table_item *next;
};

typedef struct table table;

struct table {
    int size;
    int capacity;
    int (*code_function)(void *);
    table_item **table;
};

int table_string_hashcode(const char *key);
table *table_init(int (*code_function)(void *));
int table_get_bin(table *self, int code);
void table_put(table *self, void *key, void *value);
void *table_get(table *self, void *key);
bool table_has(table *self, void *key);
void *table_delete(table *self, void *key);
void table_clear(table *self);

#endif
