#include "string_util.h"

static string_head *string_head_init(size_t length, size_t capacity) {
    size_t memory = sizeof(string_head) + length + 1;
    string_head *head = (string_head *)safe_malloc(memory);
    memset(head, 0, memory);
    head->length = length;
    head->capacity = capacity;
    return head;
}

string *string_init_with_length(char *init, size_t length) {
    string_head *head = string_head_init(length, length);
    char *s = (char *)(head + 1);
    memcpy(s, init, length);
    s[length] = '\0';
    return (string *)s;
}

string *string_allocate(size_t length) {
    string_head *head = string_head_init(length, length);
    char *s = (char *)(head + 1);
    memset(s, '\0', length + 1);
    return (string *)s;
}

string *string_init(char *init) {
    size_t len = strlen(init);
    return string_init_with_length(init, len);
}

string *string_copy(string *self) {
    string_head *head = (string_head *)((char *)self - sizeof(string_head));
    return string_init_with_length(self, head->length);
}

size_t string_len(string *s) {
    string_head *head = (string_head *)((char *)s - sizeof(string_head));
    return head->length;
}

size_t string_cap(string *s) {
    string_head *head = (string_head *)((char *)s - sizeof(string_head));
    return head->capacity;
}

void string_free(string *s) {
    free((char *)s - sizeof(string_head));
}

string *string_concat(string *a, string *b) {
    size_t len1 = string_len(a);
    size_t len2 = string_len(b);
    size_t len = len1 + len2;
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    memcpy(s, a, len1);
    memcpy(s + len1, b, len2 + 1);
    s[len] = '\0';
    return (string *)s;
}

string *string_concat_list(string **list, int size) {
    size_t len = 0;
    for (int i = 0; i < size; i++) {
        len += string_len(list[i]);
    }
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    size_t pos = 0;
    for (int i = 0; i < size; i++) {
        size_t len_i = string_len(list[i]);
        memcpy(s + pos, list[i], len_i);
        pos += len_i;
    }
    s[len] = '\0';
    return (string *)s;
}

string *string_concat_varg(int size, ...) {
    va_list ap;

    size_t len = 0;
    va_start(ap, size);
    for (int i = 0; i < size; i++) {
        len += string_len(va_arg(ap, string *));
    }
    va_end(ap);

    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);

    size_t pos = 0;
    va_start(ap, size);
    for (int i = 0; i < size; i++) {
        string *param = va_arg(ap, string *);
        size_t len_i = string_len(param);
        memcpy(s + pos, param, len_i);
        pos += len_i;
    }
    va_end(ap);

    s[len] = '\0';
    return (string *)s;
}

string *substring(string *a, size_t start, size_t end) {
    size_t len = end - start;
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    memcpy(s, a + start, len);
    s[len] = '\0';
    return (string *)s;
}

static string_head *string_resize(string_head *head, size_t capacity) {
    size_t memory = sizeof(string_head) + capacity + 1;
    string_head *new = safe_realloc(head, memory);
    new->capacity = capacity;
    return new;
}

string *string_append(string *self, char *b) {
    string_head *head = (string_head *)((char *)self - sizeof(string_head));
    size_t len_a = head->length;
    size_t len_b = strlen(b);
    size_t len = len_a + len_b;
    if (len > head->capacity) {
        head = string_resize(head, len * 2);
    }
    head->length = len;
    char *s = (char *)(head + 1);
    memcpy(s + len_a, b, len_b + 1);
    s[len] = '\0';
    return (string *)s;
}

string *string_append_char(string *self, char b) {
    string_head *head = (string_head *)((char *)self - sizeof(string_head));
    size_t len = head->length + 1;
    if (len > head->capacity) {
        head = string_resize(head, len * 2);
    }
    head->length = len;
    char *s = (char *)(head + 1);
    s[len - 1] = b;
    s[len] = '\0';
    return (string *)s;
}

int string_compare(string *a, string *b) {
    size_t len_a = string_len(a);
    size_t len_b = string_len(b);
    if (len_a == len_b) {
        return strcmp(a, b);
    }
    return len_a - len_b;
}

bool string_equal(string *a, string *b) {
    int comparison = string_compare(a, b);
    return comparison == 0;
}

void string_zero(string *self) {
    string_head *head = (string_head *)((char *)self - sizeof(string_head));
    head->length = 0;
    self[0] = '\0';
}

string *char_to_string(char ch) {
    char *str = safe_malloc(2);
    str[0] = ch;
    str[1] = '\0';
    string *s = string_init_with_length(str, 1);
    free(str);
    return s;
}

string *int_to_string(int number) {
    int len = snprintf(NULL, 0, "%d", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%d", number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *int8_to_string(int8_t number) {
    int len = snprintf(NULL, 0, "%" PRId8, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId8, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *int16_to_string(int16_t number) {
    int len = snprintf(NULL, 0, "%" PRId16, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId16, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *int32_to_string(int32_t number) {
    int len = snprintf(NULL, 0, "%" PRId32, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId32, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *int64_to_string(int64_t number) {
    int len = snprintf(NULL, 0, "%" PRId64, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId64, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *size_t_to_string(size_t number) {
    int len = snprintf(NULL, 0, "%zu", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%zu", number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *uint_to_string(unsigned int number) {
    int len = snprintf(NULL, 0, "%u", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%u", number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *uint8_to_string(uint8_t number) {
    int len = snprintf(NULL, 0, "%" PRId8, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId8, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *uint16_to_string(uint16_t number) {
    int len = snprintf(NULL, 0, "%" PRId16, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId16, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *uint32_to_string(uint32_t number) {
    int len = snprintf(NULL, 0, "%" PRId32, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId32, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *uint64_to_string(uint64_t number) {
    int len = snprintf(NULL, 0, "%" PRId64, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId64, number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *float_to_string(float number) {
    int len = snprintf(NULL, 0, "%f", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%f", number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

string *float32_to_string(float number) {
    return float_to_string(number);
}

string *float64_to_string(double number) {
    int len = snprintf(NULL, 0, "%f", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%f", number);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}

bool string_to_bool(string *str) {
    return strcmp(str, "true") == 0;
}

int string_to_int(string *str) {
    return (int)strtol(str, NULL, 10);
}

int8_t string_to_int8(string *str) {
    return (int8_t)strtol(str, NULL, 10);
}

int16_t string_to_int16(string *str) {
    return (int16_t)strtol(str, NULL, 10);
}

int32_t string_to_int32(string *str) {
    return (int32_t)strtol(str, NULL, 10);
}

int64_t string_to_int64(string *str) {
    return (int64_t)strtoll(str, NULL, 10);
}

size_t string_to_size_t(string *str) {
    return (size_t)strtoll(str, NULL, 10);
}

unsigned int string_to_uint(string *str) {
    return (unsigned int)strtoul(str, NULL, 10);
}

uint8_t string_to_uint8(string *str) {
    return (uint8_t)strtoul(str, NULL, 10);
}

uint16_t string_to_uint16(string *str) {
    return (uint16_t)strtoul(str, NULL, 10);
}

uint32_t string_to_uint32(string *str) {
    return (uint32_t)strtoul(str, NULL, 10);
}

uint64_t string_to_uint64(string *str) {
    return (uint64_t)strtoull(str, NULL, 10);
}

float string_to_float(string *str) {
    return strtof(str, NULL);
}

float string_to_float32(string *str) {
    return string_to_float(str);
}

double string_to_float64(string *str) {
    return strtod(str, NULL);
}

string *format(string *f, ...) {
    va_list ap;
    va_start(ap, f);
    int len = vsnprintf(NULL, 0, f, ap);
    va_end(ap);
    char *str = safe_malloc((len + 1) * sizeof(char));
    va_start(ap, f);
    len = vsnprintf(str, len + 1, f, ap);
    va_end(ap);
    string *s = string_init_with_length(str, len);
    free(str);
    return s;
}
