#ifndef SYSTEM_H
#define SYSTEM_H

#define _GNU_SOURCE

#include "string.h"
#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

typedef struct system_std system_std;

struct system_std {
    string stdin;
    string stdout;
    int code;
};

string new_popen(const char *command);
string core_system(const string command);

#endif
