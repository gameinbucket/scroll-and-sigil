#ifndef MEGA_WAD_H
#define MEGA_WAD_H

#include <zip.h>

#include "assets/assets.h"
#include "core/archive.h"
#include "core/fileio.h"
#include "core/string_util.h"
#include "data/array.h"
#include "data/table.h"
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

#include "modelstate.h"
#include "state.h"

void mega_wad_load_resources();
void mega_wad_load_map(world *w);

#endif
