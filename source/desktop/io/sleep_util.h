#ifndef SLEEP_UTIL_H
#define SLEEP_UTIL_H

#include <stdio.h>
#include <stdlib.h>
#include <sys/select.h>
#include <time.h>
#include <unistd.h>

#define NANO_TO_MILLISECONDS 1000000

void sleep_ms(unsigned int milliseconds);
void sleep_micro(unsigned int microseconds);

#endif
