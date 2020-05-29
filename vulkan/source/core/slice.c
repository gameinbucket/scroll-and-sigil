#include "slice.h"

slice_head *slice_head_init(const size_t member_size, const size_t length, const size_t capacity) {
    size_t memory = sizeof(slice_head) + capacity * member_size;
    slice_head *head = safe_malloc(memory);
    memset(head, 0, memory);
    head->length = length;
    head->capacity = capacity;
    return head;
}

slice_head *slice_get_head(const slice a) {
    return (slice_head *)a - 1;
}

slice slice_init(const size_t member_size, const size_t length, const size_t capacity) {
    slice_head *head = slice_head_init(member_size, length, capacity);
    return (slice_head *)head + 1;
}

slice slice_simple_init(const size_t member_size, const size_t length) {
    return slice_init(member_size, length, length);
}

slice array_to_slice(void *const array, const size_t member_size, const size_t length) {
    size_t array_memory = length * member_size;
    size_t memory = sizeof(slice_head) + array_memory;
    slice_head *new_head = safe_malloc(memory);
    new_head->length = length;
    new_head->capacity = length;
    slice_head *data = (slice_head *)new_head + 1;
    memcpy(data, array, array_memory);
    return data;
}

void slice_free(const slice a) {
    slice_head *head = slice_get_head(a);
    free(head);
}

size_t slice_len_size(const slice a) {
    slice_head *head = slice_get_head(a);
    return head->length;
}

int slice_len(const slice a) {
    return (int)slice_len_size(a);
}

size_t slice_cap_size(const slice a) {
    slice_head *head = slice_get_head(a);
    return head->capacity;
}

int slice_cap(const slice a) {
    return (int)slice_cap_size(a);
}

slice_head *slice_resize(const slice head, const size_t member_size, const size_t length) {
    size_t memory = sizeof(slice_head) + length * member_size;
    slice_head *new_head = safe_realloc(head, memory);
    new_head->length = length;
    new_head->capacity = length;
    return new_head;
}

slice slice_expand(const slice a, const slice b) {
    slice_head *head_a = slice_get_head(a);
    slice_head *head_b = slice_get_head(b);
    size_t length_a = head_a->length;
    size_t length_b = head_b->length;
    size_t length = length_a + length_b;
    slice_head *new_head = slice_resize(head_a, sizeof(void *), length);
    slice_head *data = (slice_head *)new_head + 1;
    memcpy(data + length_a * sizeof(void *), b, length_b * sizeof(void *));
    return data;
}

slice slice_push(const slice a, void *const b) {
    slice_head *head = slice_get_head(a);
    size_t length = head->length + 1;
    if (length > head->capacity) {
        head = slice_resize(head, sizeof(void *), length);
        head->capacity = length;
    }
    head->length = length;
    slice data = (slice_head *)head + 1;
    ((slice_head **)data)[length - 1] = b;
    return data;
}

slice slice_push_int(const slice a, const int b) {
    slice_head *head = slice_get_head(a);
    size_t length = head->length + 1;
    if (length > head->capacity) {
        head = slice_resize(head, sizeof(b), length);
        head->capacity = length;
    }
    head->length = length;
    slice data = (slice_head *)head + 1;
    ((int *)data)[length - 1] = b;
    return data;
}

slice slice_push_float(const slice a, const float b) {
    slice_head *head = slice_get_head(a);
    size_t length = head->length + 1;
    if (length > head->capacity) {
        head = slice_resize(head, sizeof(b), length);
        head->capacity = length;
    }
    head->length = length;
    slice data = (slice_head *)head + 1;
    ((float *)data)[length - 1] = b;
    return data;
}

void *slice_pop(const slice a) {
    slice_head *head = slice_get_head(a);
    size_t length = head->length;
    if (length == 0) {
        return 0;
    }
    head->length--;
    slice data = (slice_head *)head + 1;
    return ((slice_head **)data)[length - 1];
}

int slice_pop_int(const slice a) {
    slice_head *head = slice_get_head(a);
    size_t length = head->length;
    if (length == 0) {
        return 0;
    }
    head->length--;
    slice data = (slice_head *)head + 1;
    return ((int *)data)[length - 1];
}

float slice_pop_float(const slice a) {
    slice_head *head = slice_get_head(a);
    size_t length = head->length;
    if (length == 0) {
        return 0;
    }
    head->length--;
    slice data = (slice_head *)head + 1;
    return ((float *)data)[length - 1];
}
