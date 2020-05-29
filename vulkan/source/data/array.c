#include "array.h"

bool find_address(void *item, void *has) {
    return item == has;
}

void array_init_with_capacity(array *self, unsigned int length, unsigned int capacity) {
    if (capacity == 0) {
        self->items = NULL;
    } else {
        self->items = safe_calloc(capacity, sizeof(void *));
    }
    self->length = length;
    self->capacity = capacity;
}

void array_init(array *self, unsigned int length) {
    array_init_with_capacity(self, length, length);
}

array *create_array_with_capacity(unsigned int length, unsigned int capacity) {
    array *self = safe_malloc(sizeof(array));
    array_init_with_capacity(self, length, capacity);
    return self;
}

array *create_array(unsigned int length) {
    return create_array_with_capacity(length, length);
}

array *create_array_with_items(unsigned int length, unsigned int capacity, void **items) {
    array *self = safe_malloc(sizeof(array));
    self->items = items;
    self->length = length;
    self->capacity = capacity;
    return self;
}

void **array_copy_items(array *self) {
    size_t size = self->length * sizeof(void *);
    void **copy = safe_malloc(size);
    memcpy(copy, self->items, size);
    return copy;
}

array *create_array_copy(array *from) {
    array *self = safe_malloc(sizeof(array));
    self->items = array_copy_items(from);
    self->length = from->length;
    self->capacity = from->length;
    return self;
}

static void update_capacity(array *self, unsigned int length) {
    if (length > self->capacity) {
        if (self->capacity == 0) {
            self->capacity = length;
            self->items = safe_calloc(length, sizeof(void *));
        } else {
            self->capacity = length * 2;
            self->items = safe_realloc(self->items, self->capacity * sizeof(void *));
            memset(self->items + self->length, 0, self->capacity - self->length);
        }
    }
}

void array_push(array *self, void *item) {
    unsigned int length = self->length + 1;
    update_capacity(self, length);
    self->length = length;
    self->items[length - 1] = item;
}

void array_insert(array *self, unsigned int index, void *item) {
    unsigned int length = self->length + 1;
    update_capacity(self, length);
    self->length = length;
    void **items = self->items;
    for (unsigned int i = length - 1; i > index; i--) {
        items[i] = items[i - 1];
    }
    items[index] = item;
}

void array_insert_sort(array *self, int (*compare)(void *, void *), void *item) {
    unsigned int len = self->length;
    void **items = self->items;
    for (unsigned int i = 0; i < len; i++) {
        if (compare(item, items[i]) <= 0) {
            array_insert(self, i, item);
            return;
        }
    }
    array_push(self, item);
}

void *array_find(array *self, bool(find)(void *, void *), void *has) {
    unsigned int len = self->length;
    void **items = self->items;
    for (unsigned int i = 0; i < len; i++) {
        if (find(items[i], has)) {
            return items[i];
        }
    }
    return NULL;
}

void *array_get(array *self, unsigned int index) {
    if (index >= self->length) {
        return NULL;
    }
    return self->items[index];
}

void *array_pop(array *self) {
    if (self->length == 0) {
        return NULL;
    }
    self->length--;
    return self->items[self->length];
}

void array_remove(array *self, void *item) {
    int len = self->length;
    void **items = self->items;
    for (int i = 0; i < len; i++) {
        if (items[i] == item) {
            len--;
            while (i < len) {
                items[i] = items[i + 1];
                i++;
            }
            self->length--;
            items[len] = NULL;
            return;
        }
    }
}

void array_remove_index(array *self, unsigned int index) {
    self->length--;
    int len = self->length;
    void **items = self->items;
    for (int i = index; i < len; i++) {
        items[i] = items[i + 1];
    }
    items[len] = NULL;
}

void array_clear(array *self) {
    self->length = 0;
}

bool array_is_empty(array *self) {
    return self->length == 0;
}

bool array_not_empty(array *self) {
    return self->length != 0;
}

unsigned int array_size(array *self) {
    return self->length;
}

void release_array(array *self) {
    free(self->items);
}

void delete_array(array *self) {
    release_array(self);
    free(self);
}
