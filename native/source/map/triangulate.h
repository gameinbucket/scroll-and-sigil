#ifndef TRIANGULATE_H
#define TRIANGULATE_H

#include <float.h>
#include <stdbool.h>
#include <stdlib.h>

#include "core/math.h"
#include "core/mem.h"
#include "data/array.h"
#include "data/list.h"

#include "sector.h"
#include "vec.h"

#define TRIANGULATE_DEBUG

void triangulate_sector(sector *s, float scale);

#endif
