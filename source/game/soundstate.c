#include "soundstate.h"

soundstate *new_soundstate() {
    return safe_calloc(1, sizeof(soundstate));
}

void soundstate_load_music(soundstate *self, int id, char *path) {
    Mix_Music *music = Mix_LoadMUS(path);
    if (music == NULL) {
        fprintf(stderr, "Could not load %s\n", path);
        exit(1);
    }
    self->music[id] = music;
}

void soundstate_load_sound(soundstate *self, int id, char *path) {
    Mix_Chunk *sound = Mix_LoadWAV(path);
    if (sound == NULL) {
        fprintf(stderr, "Could not load %s\n", path);
        exit(1);
    }
    self->sound[id] = sound;
}

void soundstate_play_music(soundstate *self, int id) {
    Mix_PlayMusic(self->music[id], 0);
}

void soundstate_play_sound(soundstate *self, int id) {
    Mix_PlayChannel(-1, self->sound[id], 0);
}

void destroy_soundstate(soundstate *self) {
    Mix_HaltMusic();
    for (int i = 0; i < MUSIC_COUNT; i++) {
        Mix_FreeMusic(self->music[i]);
    }
    for (int i = 0; i < SOUND_COUNT; i++) {
        Mix_FreeChunk(self->sound[i]);
    }
}
