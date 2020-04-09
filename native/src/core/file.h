#ifndef FILE_H
#define FILE_H

#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "mem.h"
#include "string.h"

string cat(const char *path);
void core_write(const char *path, const char *content);

#endif
