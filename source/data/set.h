#ifndef SET_H
#define SET_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdlib.h>

#include "core/mem.h"
#include "core/slice.h"

extern uint64_t set_uint64_max;

typedef struct set_item set_item;

struct set_item {
    int code;
    void *key;
    void *value;
    struct set_item *next;
};

typedef struct set set;

struct set {
    int size;
    int capacity;
    int (*code_function)(void *);
    set_item **table;
};

int set_string_hashcode(const char *key);
set *set_init(int (*code_function)(void *));
int set_get_bin(set *self, int code);
void set_put(set *self, void *key, void *value);
void *set_get(set *self, void *key);
bool set_has(set *self, void *key);
void *set_delete(set *self, void *key);
void set_clear(set *self);

#endif
