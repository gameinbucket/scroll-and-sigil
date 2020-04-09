#include "string.h"

string_head *string_head_init(const size_t length, const size_t capacity) {
    size_t memory = sizeof(string_head) + length + 1;
    string_head *head = (string_head *)safe_malloc(memory);
    memset(head, 0, memory);
    head->length = length;
    head->capacity = capacity;
    return head;
}

string string_init_with_length(const char *init, const size_t length) {
    string_head *head = string_head_init(length, length);
    char *s = (char *)(head + 1);
    memcpy(s, init, length);
    s[length] = '\0';
    return (string)s;
}

string string_init(const char *init) {
    size_t len = strlen(init);
    return string_init_with_length(init, len);
}

size_t string_len_size(const string s) {
    string_head *head = (string_head *)((char *)s - sizeof(string_head));
    return head->length;
}

int string_len(const string s) {
    return (int)string_len_size(s);
}

size_t string_cap_size(const string s) {
    string_head *head = (string_head *)((char *)s - sizeof(string_head));
    return head->capacity;
}

int string_cap(const string s) {
    return (int)string_cap_size(s);
}

void string_free(const string s) {
    free((char *)s - sizeof(string_head));
}

string concat(const string a, const string b) {
    const size_t len1 = string_len_size(a);
    const size_t len2 = string_len_size(b);
    const size_t len = len1 + len2;
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    memcpy(s, a, len1);
    memcpy(s + len1, b, len2 + 1);
    s[len] = '\0';
    return (string)s;
}

string concat_list(const string *list, const int size) {
    size_t len = 0;
    for (int i = 0; i < size; i++) {
        len += string_len_size(list[i]);
    }
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    size_t pos = 0;
    for (int i = 0; i < size; i++) {
        size_t len_i = string_len_size(list[i]);
        memcpy(s + pos, list[i], len_i);
        pos += len_i;
    }
    s[len] = '\0';
    return (string)s;
}

string concat_varg(const int size, ...) {
    va_list ap;

    size_t len = 0;
    va_start(ap, size);
    for (int i = 0; i < size; i++) {
        len += string_len_size(va_arg(ap, string));
    }
    va_end(ap);

    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);

    size_t pos = 0;
    va_start(ap, size);
    for (int i = 0; i < size; i++) {
        const string param = va_arg(ap, string);
        size_t len_i = string_len_size(param);
        memcpy(s + pos, param, len_i);
        pos += len_i;
    }
    va_end(ap);

    s[len] = '\0';
    return (string)s;
}

string substring(const string a, const size_t start, const size_t end) {
    const size_t len = end - start;
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    memcpy(s, a + start, len);
    s[len] = '\0';
    return (string)s;
}

string string_append(const string a, const char *b) {
    const size_t len1 = string_len_size(a);
    const size_t len2 = strlen(b);
    const size_t len = len1 + len2;
    string_head *head = string_head_init(len, len);
    char *s = (char *)(head + 1);
    memcpy(s, a, len1);
    memcpy(s + len1, b, len2 + 1);
    s[len] = '\0';
    return (string)s;
}

int string_compare(const string a, const string b) {
    return strcmp(a, b);
}

bool string_equal(const string a, const string b) {
    int comparison = string_compare(a, b);
    return comparison == 0;
}

string char_to_string(const char ch) {
    char *str = safe_malloc(2);
    str[0] = ch;
    str[1] = '\0';
    string s = string_init_with_length(str, 1);
    free(str);
    return s;
}

string int_to_string(const int number) {
    int len = snprintf(NULL, 0, "%d", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%d", number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string int8_to_string(const int8_t number) {
    int len = snprintf(NULL, 0, "%" PRId8, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId8, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string int16_to_string(const int16_t number) {
    int len = snprintf(NULL, 0, "%" PRId16, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId16, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string int32_to_string(const int32_t number) {
    int len = snprintf(NULL, 0, "%" PRId32, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId32, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string int64_to_string(const int64_t number) {
    int len = snprintf(NULL, 0, "%" PRId64, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId64, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string size_t_to_string(const int64_t number) {
    int len = snprintf(NULL, 0, "%zu", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%zu", number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string uint_to_string(const unsigned int number) {
    int len = snprintf(NULL, 0, "%u", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%u", number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string uint8_to_string(const uint8_t number) {
    int len = snprintf(NULL, 0, "%" PRId8, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId8, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string uint16_to_string(const uint16_t number) {
    int len = snprintf(NULL, 0, "%" PRId16, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId16, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string uint32_to_string(const uint32_t number) {
    int len = snprintf(NULL, 0, "%" PRId32, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId32, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string uint64_to_string(const uint64_t number) {
    int len = snprintf(NULL, 0, "%" PRId64, number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%" PRId64, number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string float_to_string(const float number) {
    int len = snprintf(NULL, 0, "%f", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%f", number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

string float32_to_string(const float number) {
    return float_to_string(number);
}

string float64_to_string(const double number) {
    int len = snprintf(NULL, 0, "%f", number);
    char *str = safe_malloc(len + 1);
    snprintf(str, len + 1, "%f", number);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}

int string_to_int(const string str) {
    return (int)strtol(str, NULL, 10);
}

int8_t string_to_int8(const string str) {
    return (int8_t)strtol(str, NULL, 10);
}

int16_t string_to_int16(const string str) {
    return (int16_t)strtol(str, NULL, 10);
}

int32_t string_to_int32(const string str) {
    return (int32_t)strtol(str, NULL, 10);
}

int64_t string_to_int64(const string str) {
    return (int64_t)strtoll(str, NULL, 10);
}

size_t string_to_size_t(const string str) {
    return (size_t)strtoll(str, NULL, 10);
}

unsigned int string_to_uint(const string str) {
    return (unsigned int)strtoul(str, NULL, 10);
}

uint8_t string_to_uint8(const string str) {
    return (uint8_t)strtoul(str, NULL, 10);
}

uint16_t string_to_uint16(const string str) {
    return (uint16_t)strtoul(str, NULL, 10);
}

uint32_t string_to_uint32(const string str) {
    return (uint32_t)strtoul(str, NULL, 10);
}

uint64_t string_to_uint64(const string str) {
    return (uint64_t)strtoull(str, NULL, 10);
}

float string_to_float(const string str) {
    return strtof(str, NULL);
}

float string_to_float32(const string str) {
    return string_to_float(str);
}

double string_to_float64(const string str) {
    return strtod(str, NULL);
}

string format(const string f, ...) {
    va_list ap;
    va_start(ap, f);
    int len = vsnprintf(NULL, 0, f, ap);
    va_end(ap);
    char *str = safe_malloc((len + 1) * sizeof(char));
    va_start(ap, f);
    len = vsnprintf(str, len + 1, f, ap);
    va_end(ap);
    string s = string_init_with_length(str, len);
    free(str);
    return s;
}
