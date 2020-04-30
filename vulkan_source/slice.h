#ifndef SLICE_H
#define SLICE_H

#include <inttypes.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "mem.h"

struct __attribute__((__packed__)) slice_head {
    size_t length;
    size_t capacity;
    void **slice;
};

typedef void *slice;
typedef struct slice_head slice_head;

slice slice_init(const size_t member_size, const size_t length, const size_t capacity);
slice slice_simple_init(const size_t member_size, const size_t length);
slice array_to_slice(void *const array, const size_t member_size, const size_t length);
void slice_free(const slice a);
size_t slice_len_size(const slice a);
int slice_len(const slice a);
size_t slice_cap_size(const slice a);
int slice_cap(const slice a);
slice_head *slice_resize(const slice head, const size_t member_size, const size_t length);
slice slice_expand(const slice a, const slice b);
slice slice_push(const slice a, void *const b);
slice slice_push_int(const slice a, const int b);
slice slice_push_float(const slice a, const float b);
void *slice_pop(const slice a);
int slice_pop_int(const slice a);
float slice_pop_float(const slice a);

#endif
