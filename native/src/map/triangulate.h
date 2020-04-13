#ifndef TRIANGULATE_H
#define TRIANGULATE_H

#define DEBUG_TRIANGULATE

#include <stdbool.h>

#include "core/mem.h"

#include "sector.h"
#include "vec.h"

void triangulate_sector(sector *s, float scale);

#endif
