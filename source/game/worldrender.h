#ifndef WORLD_RENDER_H
#define WORLD_RENDER_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "assets/assets.h"
#include "core/mem.h"
#include "core/string_util.h"
#include "data/uint_table.h"
#include "graphics/framebuffer.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/renderbuffer.h"
#include "graphics/shader.h"
#include "graphics/texture.h"
#include "mesh/biped.h"
#include "world/world.h"

#include "camera.h"
#include "renderstate.h"

typedef struct worldrender worldrender;

struct worldrender {
    renderstate *rs;
    world *w;
    bool current_cache;
    uint_table *cache_a;
    uint_table *cache_b;
};

worldrender *new_worldrender(renderstate *rs, world *w);

void worldrender_create_buffers(worldrender *self);
void world_render(worldrender *self, camera *c);

void destroy_worldrender(worldrender *self);

#endif
