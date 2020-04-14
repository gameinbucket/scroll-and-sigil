#ifndef HASHMAP_H
#define HASHMAP_H

#include <inttypes.h>
#include <stdlib.h>

#include "core/mem.h"
#include "core/slice.h"

extern uint64_t hashmap_uint64_max;

typedef struct hashmap_item hashmap_item;

struct hashmap_item {
    int code;
    void *key;
    void *value;
    struct hashmap_item *next;
};

typedef struct hashmap hashmap;

struct hashmap {
    int size;
    int capacity;
    int (*code_function)(void *);
    hashmap_item **table;
};

int hashmap_string_hashcode(const char *key);
hashmap *hashmap_init(int (*code_function)(void *));
int hashmap_get_bin(hashmap *self, int code);
void hashmap_put(hashmap *self, void *key, void *value);
void *hashmap_get(hashmap *self, void *key);
bool hashmap_has(hashmap *self, void *key);
void *hashmap_delete(hashmap *self, void *key);
void hashmap_clear(hashmap *self);

#endif
