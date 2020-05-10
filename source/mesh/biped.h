#ifndef BIPED_H
#define BIPED_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "graphics/model.h"

#define BIPED_SCALE 0.03f
#define BIPED_BODY 0
#define BIPED_HEAD 1
#define BIPED_LEFT_ARM 2
#define BIPED_LEFT_FOREARM 3
#define BIPED_RIGHT_ARM 4
#define BIPED_RIGHT_FOREARM 5
#define BIPED_LEFT_LEG 6
#define BIPED_LEFT_KNEE 7
#define BIPED_RIGHT_LEG 8
#define BIPED_RIGHT_KNEE 9
#define BIPED_NECK 10
#define BIPED_BONES 11

model *create_biped();

#endif
