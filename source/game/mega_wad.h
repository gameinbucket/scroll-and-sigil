#ifndef MEGA_WAD_H
#define MEGA_WAD_H

#include <zip.h>

#include "assets/assets.h"
#include "core/archive.h"
#include "core/fileio.h"
#include "core/string_util.h"
#include "data/array.h"
#include "data/table.h"
#include "math/matrix.h"
#include "opengl/graphics.h"
#include "opengl/render.h"
#include "opengl/texture.h"
#include "places/place.h"
#include "things/baron.h"
#include "things/blood.h"
#include "things/hero.h"
#include "things/scenery.h"
#include "wad/parser.h"
#include "world/world.h"
#include "world/worldbuild.h"

#include "modelstate.h"
#include "renderstate.h"
#include "soundstate.h"
#include "state.h"

void wad_load_resources(renderstate *rs, soundstate *ss, modelstate *ms);
void wad_load_map(world *w, input *in, modelstate *ms);

#endif
