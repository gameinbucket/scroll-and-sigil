#include "overlap.h"

void thing_line_overlap(thing *th, line *ld) {
    float vx = ld->vb.x - ld->va.x;
    th->x += vx;
}
