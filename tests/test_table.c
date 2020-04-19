#include "data/table.h"
#include "test.h"

typedef struct {
    int value;
} Integer;

uint64_t integer_hashcode(void *key) {
    return ((Integer *)key)->value;
}

static char *test_remove() {
    char *x = "foo";
    char *y = "bar";
    char *z = "zoo";

    Integer w = {14};
    Integer k = {16};
    Integer n = {18};

    table *tab = new_table(&table_string_hashcode);

    table_put(tab, x, &w);
    table_put(tab, y, &k);
    table_put(tab, z, &n);

    table_remove(tab, x);
    table_remove(tab, y);
    table_remove(tab, z);

    ASSERT("size == 0", table_size(tab) == 0);

    ASSERT("has(z) == false", table_has(tab, z) == false);
    ASSERT("has(x) == false", table_has(tab, x) == false);
    ASSERT("has(y) == false", table_has(tab, y) == false);

    return 0;
}

static char *test_stress() {

    unsigned int size = 10000;

    Integer *keys = safe_calloc(size, sizeof(Integer));
    Integer *values = safe_calloc(size, sizeof(Integer));

    table *tab = new_table(&integer_hashcode);

    for (unsigned int i = 0; i < size; i++) {
        keys[i] = (Integer){i};
        values[i] = (Integer){rand()};

        table_put(tab, &keys[i], &values[i]);
    }

    ASSERT("size", table_size(tab) == size);

    for (unsigned int i = 0; i < size; i++) {
        Integer key = (Integer){keys[i].value};
        ASSERT("get(i) == value[i]", table_get(tab, &key) == &values[i]);
    }

    return 0;
}

static char *test_string() {
    char *x = "foo";
    char *y = "bar";
    char *z = "zoo";

    Integer w = {14};
    Integer k = {16};
    Integer n = {18};

    table *tab = new_table(&table_string_hashcode);

    table_put(tab, x, &w);
    table_put(tab, y, &k);
    table_put(tab, z, &n);

    ASSERT("size == 3", table_size(tab) == 3);

    ASSERT("get(z) == n", table_get(tab, z) == &n);
    ASSERT("get(x) == w", table_get(tab, x) == &w);
    ASSERT("get(y) == k", table_get(tab, y) == &k);

    return 0;
}

static char *test_address() {
    Integer x = {4};
    Integer y = {6};
    Integer z = {12};

    Integer w = {14};
    Integer k = {16};
    Integer n = {18};

    table *tab = new_table(&table_address_hashcode);

    table_put(tab, &x, &w);
    table_put(tab, &y, &k);
    table_put(tab, &z, &n);

    ASSERT("size == 3", table_size(tab) == 3);

    ASSERT("get(z) == n", table_get(tab, &z) == &n);
    ASSERT("get(x) == w", table_get(tab, &x) == &w);
    ASSERT("get(y) == k", table_get(tab, &y) == &k);

    return 0;
}

char *test_table_all() {
    TEST(test_address);
    TEST(test_string);
    TEST(test_stress);
    TEST(test_remove);
    return 0;
}
