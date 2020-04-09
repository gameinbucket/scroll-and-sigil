#ifndef STRING_H
#define STRING_H

#include <inttypes.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "mem.h"

typedef char *string;
typedef struct string_head string_head;

struct __attribute__((__packed__)) string_head {
    size_t length;
    size_t capacity;
    char **chars;
};

string string_init_with_length(const char *init, size_t length);
string string_init(const char *init);

size_t string_len_size(const string s);
int string_len(const string s);
size_t string_cap_size(const string s);
int string_cap(const string s);
void string_free(const string s);

string concat(const string a, const string b);
string concat_list(const string *list, const int size);
string concat_varg(const int size, ...);

string substring(const string s, const size_t start, const size_t end);

string string_append(const string a, const char *b);

int string_compare(const string a, const string b);
bool string_equal(const string a, const string b);

string char_to_string(const char ch);
string int_to_string(const int number);
string int8_to_string(const int8_t number);
string int16_to_string(const int16_t number);
string int32_to_string(const int32_t number);
string int64_to_string(const int64_t number);
string size_t_to_string(const int64_t number);

string uint_to_string(const unsigned int number);
string uint8_to_string(const uint8_t number);
string uint16_to_string(const uint16_t number);
string uint32_to_string(const uint32_t number);
string uint64_to_string(const uint64_t number);

string float_to_string(const float number);
string float32_to_string(const float number);
string float64_to_string(const double number);

int string_to_int(const string str);
int8_t string_to_int8(const string str);
int16_t string_to_int16(const string str);
int32_t string_to_int32(const string str);
int64_t string_to_int64(const string str);
size_t string_to_size_t(const string str);

unsigned int string_to_uint(const string str);
uint8_t string_to_uint8(const string str);
uint16_t string_to_uint16(const string str);
uint32_t string_to_uint32(const string str);
uint64_t string_to_uint64(const string str);

float string_to_float(const string str);
float string_to_float32(const string str);
double string_to_float64(const string str);

string format(const string f, ...);

#endif
