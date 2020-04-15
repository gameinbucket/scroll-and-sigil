#include "data/array.h"

extern int tests_run;

typedef struct {
    int value;
} Integer;

int main() {
    Integer x = {4};
    Integer y = {6};
    Integer z = {12};

    array *ls = array_init(0);
    array_push(ls, &x);
    array_push(ls, &y);
    array_push(ls, &z);

    printf("size: %d\n", array_size(ls));
    printf("size: %d\n", ls->length);

    printf("[0]: %d\n", ((Integer *)ls->items[0])->value);
    printf("[1]: %d\n", ((Integer *)ls->items[1])->value);
    printf("[2]: %d\n", ((Integer *)ls->items[2])->value);

    return 0;
}
