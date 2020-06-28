#ifndef MEGA_WAD_H
#define MEGA_WAD_H

#include <zip.h>

#include "assets/assets.h"
#include "common/archive.h"
#include "common/fileio.h"
#include "common/string_util.h"
#include "data/array.h"
#include "data/table.h"
#include "graphics/model_system.h"
#include "input/input.h"
#include "math/matrix.h"
#include "places/place.h"
#include "things/baron.h"
#include "things/blood.h"
#include "things/hero.h"
#include "things/scenery.h"
#include "wad/parser.h"
#include "world/world.h"
#include "world/worldbuild.h"

#include "sound_system.h"
#include "state.h"

void mega_wad_load_resources(sound_system *ss, model_system *ms);
void mega_wad_load_map(world *w, input *in, model_system *ms);

#endif
