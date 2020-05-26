#ifndef FILE_IO_H
#define FILE_IO_H

#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "mem.h"
#include "string_util.h"

size_t file_size(char *path);
size_t file_binary_size(char *path);
string *cat(char *path);
void core_write(char *path, char *content);
char *read_binary(char *path, size_t *size_pointer);

#endif
