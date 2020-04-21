#ifndef SOUND_STATE_H
#define SOUND_STATE_H

#include <SDL2/SDL_mixer.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

#define SOUND_MAX_CHANNELS 8

typedef struct soundstate soundstate;

struct soundstate {
    Mix_Music *vampire_killer;
    Mix_Chunk *baron_scream;
};

soundstate *new_soundstate();
void soundstate_load_files(soundstate *self);
void destroy_soundstate(soundstate *self);

#endif
