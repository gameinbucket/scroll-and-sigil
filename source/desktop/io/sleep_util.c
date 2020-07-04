#include "sleep_util.h"

// void sleep_ms(unsigned int milliseconds) {
//     sleep(milliseconds);
// }

// void sleep_ms(unsigned int milliseconds) {
//     struct timespec delta = {milliseconds / 1000, (milliseconds % 1000) * NANO_TO_MILLISECONDS};
//     if (nanosleep(&delta, &delta) < 0) {
//         fprintf(stderr, "Error: nanosleep\n");
//     }
// }

// #include <windows.h>
// void sleep_ms(int milliseconds) {
//     Sleep(milliseconds);
// }

// void sleep_ms(unsigned int milliseconds) {
//     usleep(milliseconds * 1000);
// }

void sleep_ms(unsigned int milliseconds) {

    fd_set rfds;
    FD_ZERO(&rfds);
    FD_SET(0, &rfds);

    struct timeval time;
    time.tv_sec = 0;
    time.tv_usec = 1000 * milliseconds;

    select(1, &rfds, NULL, NULL, &time);
}

void sleep_micro(unsigned int microseconds) {

    fd_set rfds;
    FD_ZERO(&rfds);
    FD_SET(0, &rfds);

    struct timeval time;
    time.tv_sec = 0;
    time.tv_usec = microseconds;

    select(1, &rfds, NULL, NULL, &time);
}
