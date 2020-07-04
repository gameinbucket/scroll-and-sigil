#ifndef SOUND_SYSTEM_H
#define SOUND_SYSTEM_H

#include <SDL2/SDL_mixer.h>

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <zip.h>

#include "assets/assets.h"
#include "common/mem.h"
#include "io/archive.h"

#define SOUND_MAX_CHANNELS 8

typedef struct sound_system sound_system;

struct sound_system {
    bool mute;
    Mix_Music **music;
    Mix_Chunk **sound;
};

sound_system *create_sound_system();

void sound_system_load_music(sound_system *self, struct zip *z, int id, char *path);
void sound_system_load_sound(sound_system *self, struct zip *z, int id, char *path);

void sound_system_play_music(sound_system *self, int id);
void sound_system_play_sound(sound_system *self, int id);

void delete_sound_system(sound_system *self);

#endif
