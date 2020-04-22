#ifndef SOUND_STATE_H
#define SOUND_STATE_H

#include <SDL2/SDL_mixer.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "assets/assets.h"
#include "core/mem.h"

#define SOUND_MAX_CHANNELS 8

typedef struct soundstate soundstate;

struct soundstate {
    Mix_Music **music;
    Mix_Chunk **sound;
};

soundstate *new_soundstate();

void soundstate_load_music(soundstate *self, int id, char *path);
void soundstate_load_sound(soundstate *self, int id, char *path);

void soundstate_play_music(soundstate *self, int id);
void soundstate_play_sound(soundstate *self, int id);

void destroy_soundstate(soundstate *self);

#endif
