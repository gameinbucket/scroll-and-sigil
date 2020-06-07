#include "sleep_util.h"

void sleep_ms(unsigned int milliseconds) {
    // struct timespec delta = {milliseconds / 1000, (milliseconds % 1000) * NANO_TO_MILLISECONDS};
    // if (nanosleep(&delta, &delta) < 0) {
    //     fprintf(stderr, "Error: nanosleep\n");
    // }
    sleep(milliseconds);
}

// #include <windows.h>
// void sleep_ms(int milliseconds) {
//     Sleep(milliseconds);
// }

// #include <unistd.h>
// void sleep_ms(int milliseconds) {
//     usleep(milliseconds * 1000);
// }
