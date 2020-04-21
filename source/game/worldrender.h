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

#include "core/mem.h"
#include "core/string.h"
#include "data/uint_table.h"
#include "graphics/framebuffer.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/renderbuffer.h"
#include "graphics/shader.h"
#include "graphics/texture.h"
#include "world/world.h"

#include "camera.h"
#include "renderstate.h"
#include "wad.h"

void world_render(renderstate *rs, world *w, camera *c);

#endif
