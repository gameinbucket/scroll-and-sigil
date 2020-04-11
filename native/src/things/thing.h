#ifndef THING_H
#define THING_H

extern float gravity;
extern float inverse_block_size;

struct thing {
    float x;
    float y;
    float z;
    float radius;
    float height;
    int min_bx;
    int min_by;
    int min_bz;
    int max_bx;
    int max_by;
    int max_bz;
    float delta_x;
    float delta_y;
    float delta_z;
};

typedef struct thing thing;

void thing_block_borders(thing *self);
void thing_update(thing *self);

#endif
