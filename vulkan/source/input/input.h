#ifndef INPUT_H
#define INPUT_H

#include <stdbool.h>

struct input {
    int mouse_x;
    int mouse_y;
    bool mouse_down;
    bool move_left;
    bool move_right;
    bool move_up;
    bool move_down;
    bool move_forward;
    bool move_backward;
    bool look_up;
    bool look_down;
    bool look_left;
    bool look_right;
    bool console;
};

typedef struct input input;

#endif
