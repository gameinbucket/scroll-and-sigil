#include "soundstate.h"

soundstate *create_soundstate() {
    return safe_calloc(1, sizeof(soundstate));
}

void soundstate_load_music(soundstate *self, struct zip *z, int id, char *path) {
    Mix_Music *music;
    if (z != NULL) {
        struct archive_blob blob = read_blob_from_zip(z, path);
        SDL_RWops *rw = SDL_RWFromMem((void *)blob.data, blob.size);
        music = Mix_LoadMUS_RW(rw, 0);
    } else {
        music = Mix_LoadMUS(path);
    }
    if (music == NULL) {
        fprintf(stderr, "Error loading music file: %s\n", path);
        exit(1);
    }
    self->music[id] = music;
}

void soundstate_load_sound(soundstate *self, struct zip *z, int id, char *path) {
    Mix_Chunk *sound;
    if (z != NULL) {
        struct archive_blob blob = read_blob_from_zip(z, path);
        SDL_RWops *rw = SDL_RWFromMem((void *)blob.data, blob.size);
        sound = Mix_LoadWAV_RW(rw, 0);
    } else {
        sound = Mix_LoadWAV(path);
    }
    if (sound == NULL) {
        fprintf(stderr, "Error loading sound file: %s\n", path);
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

void delete_soundstate(soundstate *self) {
    Mix_HaltMusic();
    for (int i = 0; i < MUSIC_COUNT; i++) {
        Mix_FreeMusic(self->music[i]);
    }
    for (int i = 0; i < SOUND_COUNT; i++) {
        Mix_FreeChunk(self->sound[i]);
    }
}
