#ifndef SLEEP_H
#define SLEEP_H

#include <stdio.h>

#ifdef WIN32
#include <windows.h>
#elif _POSIX_C_SOURCE >= 199309L
#include <time.h>
#else
#include <unistd.h>
#endif

#define NANO_TO_MILLISECONDS 1000000

void sleep_ms(int milliseconds) {
#ifdef WIN32
    Sleep(milliseconds);
#elif _POSIX_C_SOURCE >= 199309L
    struct timespec delta = {milliseconds / 1000, (milliseconds % 1000) * NANO_TO_MILLISECONDS};
    if (nanosleep(&delta, &delta) < 0) {
        fprintf(stderr, "Error: nanosleep\n");
    }
#else
    usleep(milliseconds * 1000);
#endif
}

#endif
