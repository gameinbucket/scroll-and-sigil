#ifndef INPUT_H
#define INPUT_H

#include <stdbool.h>

struct input {
    int mouse_x;
    int mouse_y;
    bool mouse_down;
    bool left;
    bool right;
    bool up;
    bool down;
};

typedef struct input input;

#endif
