#ifndef WORLD_RENDER_H
#define WORLD_RENDER_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "vulkan/vulkan_renderbuffer.h"

#include "assets/assets.h"
#include "core/mem.h"
#include "core/string_util.h"
#include "data/uint_table.h"
#include "math/matrix.h"
#include "render/render.h"
#include "world/world.h"

#include "camera.h"

typedef struct worldrender worldrender;

struct worldrender {
    world *w;
    bool current_cache;
    uint_table *sector_cache_a;
    uint_table *sector_cache_b;
    struct vulkan_renderbuffer *thing_buffer;
};

worldrender *create_worldrender(world *w);

void worldrender_create_buffers(worldrender *self);
void world_render(worldrender *self);

void delete_worldrender(worldrender *self);

#endif
