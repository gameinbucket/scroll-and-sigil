#ifndef WAD_H
#define WAD_H

// #define WAD_USE_ZIP

#ifdef WAD_USE_ZIP
#include <zip.h>
#endif

#include <SDL2/SDL.h>

#include "core/file.h"
#include "core/string.h"
#include "data/array.h"
#include "data/table.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/texture.h"
#include "places/place.h"
#include "world/world.h"

#include "renderstate.h"

#define SHADER_SCREEN 0
#define SHADER_TEXTURE_2D 1
#define SHADER_TEXTURE_3D 2
#define SHADER_TEXTURE_3D_COLOR 3

#define TEXTURE_BARON 0
#define TEXTURE_PLANK 1

void wad_load_resources(renderstate *rs);

void wad_load_map(renderstate *rs, world *w);

#endif