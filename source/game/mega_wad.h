#ifndef MEGA_WAD_H
#define MEGA_WAD_H

#include <zip.h>

#include "assets/assets.h"
#include "core/archive.h"
#include "core/fileio.h"
#include "core/string_util.h"
#include "data/array.h"
#include "data/table.h"
#include "graphics/graphics.h"
#include "graphics/matrix.h"
#include "graphics/render.h"
#include "graphics/texture.h"
#include "places/place.h"
#include "things/baron.h"
#include "things/hero.h"
#include "wad/parser.h"
#include "world/world.h"
#include "world/worldbuild.h"

#include "modelstate.h"
#include "renderstate.h"
#include "soundstate.h"

void wad_load_resources(renderstate *rs, soundstate *ss, modelstate *ms);
void wad_load_map(input *in, world *w);

#endif
