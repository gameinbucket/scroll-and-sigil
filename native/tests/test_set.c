#include "data/set.h"
#include "test.h"

typedef struct {
    int value;
} Integer;

static char *test_set() {
    Integer x = {4};
    Integer y = {6};
    Integer z = {12};

    array *ls = array_init(0);
    array_push(ls, &x);
    array_push(ls, &y);
    array_push(ls, &z);

    ASSERT("size == 3", array_size(ls) == 3);
    ASSERT("capacity >= length", ls->capacity >= ls->length);

    ASSERT("get(0) == 4", ((Integer *)array_get(ls, 0))->value == 4);
    ASSERT("get(1) == 6", ((Integer *)array_get(ls, 1))->value == 6);
    ASSERT("get(2) == 12", ((Integer *)array_get(ls, 2))->value == 12);

    ASSERT("1st pop", ((Integer *)array_pop(ls))->value == 12);
    ASSERT("2nd pop", ((Integer *)array_pop(ls))->value == 6);
    ASSERT("3rdt pop", ((Integer *)array_pop(ls))->value == 4);

    ASSERT("size == 0", array_size(ls) == 0);
    ASSERT("capacity >= length", ls->capacity >= ls->length);

    array_free(ls);

    return 0;
}

static char *all_tests() {
    TEST(test_set);
    return 0;
}

int main() {
    printf("\n");
    char *result = all_tests();
    if (result != 0) {
        printf("%s\n", result);
    }
    printf("\nSuccess: %d, Failed: %d, Total: %d\n\n", tests_success, tests_fail, tests_count);
    return 0;
}
