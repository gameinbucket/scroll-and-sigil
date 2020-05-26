#ifndef WAD_H
#define WAD_H

#include <zip.h>

#include "assets/assets.h"
#include "core/archive.h"
#include "core/fileio.h"
#include "core/string_util.h"
#include "data/array.h"
#include "data/table.h"
#include "math/matrix.h"

#include "renderstate.h"

void wad_load_resources(renderstate *rs);

#endif
