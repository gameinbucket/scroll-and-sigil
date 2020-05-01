#ifndef FILE_H
#define FILE_H

#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "mem.h"
#include "string.h"

char *read_binary(char *path, size_t *size_pointer);

#endif
