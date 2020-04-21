#include "soundstate.h"

soundstate *new_soundstate() {
    return safe_calloc(1, sizeof(soundstate));
}

void soundstate_load_files(soundstate *self) {

    char *vampire_wav = "music/vampire-killer.wav";
    self->vampire_killer = Mix_LoadMUS(vampire_wav);
    if (self->vampire_killer == NULL) {
        fprintf(stderr, "Could not load %s\n", vampire_wav);
        exit(1);
    }

    Mix_PlayMusic(self->vampire_killer, 0);

    char *baron_wav = "sounds/baron-scream.wav";
    self->baron_scream = Mix_LoadWAV(baron_wav);
    if (self->baron_scream == NULL) {
        fprintf(stderr, "Could not load %s\n", baron_wav);
        exit(1);
    }

    Mix_PlayChannel(-1, self->baron_scream, 0);
}

void destroy_soundstate(soundstate *self) {
    Mix_HaltMusic();
    Mix_FreeMusic(self->vampire_killer);
    Mix_FreeChunk(self->baron_scream);
}
