#include "list.h"

list *list_init() {
    return safe_calloc(1, sizeof(list));
}

void list_add(list *self, void *item) {
    if (self->item == NULL) {
        self->item = item;
        return;
    }
    list *link = self->next;
    list *node = safe_calloc(1, sizeof(list));
    node->item = item;
    node->next = link;
    self->next = node;
}

void list_push(list *self, void *item) {
    if (self->item == NULL) {
        self->item = item;
        return;
    }
    list *tail = safe_calloc(1, sizeof(list));
    tail->item = item;
    while (true) {
        list *next = self->next;
        if (next == NULL) {
            self->next = tail;
            return;
        }
        self = next;
    }
}

void list_remove(list *self, void *item) {
    if (self->item == NULL) {
        return;
    }
    do {
        list *next = self->next;
        if (self->item == item) {
            if (next == NULL) {
                self->item = NULL;
            } else {
                self->item = next->item;
                self->next = next->next;
                free(next);
            }
            return;
        }
        self = next;
    } while (self);
}

void list_remove_index(list *self, unsigned int index) {
    if (self->item == NULL) {
        return;
    }
    unsigned int i = 0;
    do {
        list *next = self->next;
        if (i == index) {
            if (next == NULL) {
                self->item = NULL;
            } else {
                self->item = next->item;
                self->next = next->next;
                free(next);
            }
            return;
        }
        self = next;
    } while (self);
}

void list_insert(list *self, unsigned int index, void *item) {
    if (self->item == NULL) {
        self->item = item;
        return;
    }
    list *tail = safe_calloc(1, sizeof(list));
    tail->item = item;
    unsigned int i = 0;
    while (true) {
        list *next = self->next;
        if (next == NULL || i == index) {
            tail->next = next;
            self->next = tail;
            return;
        }
        i++;
        self = next;
    }
}

void list_insert_sort(list *self, int (*compare)(void *, void *), void *item) {
    if (self->item == NULL) {
        self->item = item;
        return;
    }
    list *tail = safe_calloc(1, sizeof(list));
    tail->item = item;
    while (true) {
        list *next = self->next;
        if (next == NULL || compare(item, self->item) <= 0) {
            tail->next = next;
            self->next = tail;
            return;
        }
        self = next;
    }
}

void *list_find(list *self, bool(find)(void *x, void *), void *has) {
    if (self->item == NULL) {
        return NULL;
    }
    while (true) {
        void *item = self->item;
        if (find(item, has)) {
            return item;
        }
        self = self->next;
        if (!self) {
            return NULL;
        }
    }
}

void *list_get(list *self, unsigned int index) {
    if (self->item == NULL) {
        return NULL;
    }
    for (unsigned int i = 0; i < index; i++) {
        self = self->next;
        if (!self) {
            return NULL;
        }
    }
    return self->item;
}

bool list_is_empty(list *self) {
    return self->item == NULL;
}

bool list_not_empty(list *self) {
    return self->item != NULL;
}

unsigned int list_size(list *self) {
    if (self->item == NULL) {
        return 0;
    }
    unsigned int size = 0;
    while (true) {
        size++;
        self = self->next;
        if (!self) {
            return size;
        }
    }
}

void **list_to_array(list *self) {
    unsigned int size = list_size(self);
    if (size == 0) {
        return NULL;
    }
    void **array = safe_malloc(size * sizeof(void *));
    for (unsigned int i = 0; i < size; i++) {
        array[i] = self->item;
        self = self->next;
    }
    return array;
}

void list_free(list *self) {
    do {
        list *node = self->next;
        free(self);
        self = node;
    } while (self);
}
