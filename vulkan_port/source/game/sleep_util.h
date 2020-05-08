#ifndef SLEEP_UTIL_H
#define SLEEP_UTIL_H

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define NANO_TO_MILLISECONDS 1000000

void sleep_ms(int milliseconds) {
    // struct timespec delta = {milliseconds / 1000, (milliseconds % 1000) * NANO_TO_MILLISECONDS};
    // if (nanosleep(&delta, &delta) < 0) {
    //     fprintf(stderr, "Error: nanosleep\n");
    // }
    sleep(1);
}

// #include <windows.h>
// void sleep_ms(int milliseconds) {
//     Sleep(milliseconds);
// }

// #include <unistd.h>
// void sleep_ms(int milliseconds) {
//     usleep(milliseconds * 1000);
// }

#endif
