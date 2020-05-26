#ifndef WORLD_RENDER_H
#define WORLD_RENDER_H

#include <GL/glew.h>

#include "x-gl.h"

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
#include "math/matrix.h"
#include "opengl/framebuffer.h"
#include "opengl/graphics.h"
#include "opengl/render.h"
#include "opengl/renderbuffer.h"
#include "opengl/shader.h"
#include "opengl/texture.h"
#include "world/world.h"

#include "camera.h"
#include "renderstate.h"

typedef struct worldrender worldrender;

struct worldrender {
    renderstate *rs;
    world *w;
    bool current_cache;
    uint_table *sector_cache_a;
    uint_table *sector_cache_b;
    renderbuffer *thing_buffer;
};

worldrender *create_worldrender(renderstate *rs, world *w);

void worldrender_create_buffers(worldrender *self);
void world_render(worldrender *self, camera *c, float view[16], float view_projection[16], vec3 *light_direction, float depth_bias_mvp[16], GLuint depth_texture);

void delete_worldrender(worldrender *self);

#endif
