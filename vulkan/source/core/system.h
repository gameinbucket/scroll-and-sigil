#ifndef SYSTEM_H
#define SYSTEM_H

#define _GNU_SOURCE

#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "string_util.h"

string *cmd(char *command);

#endif
