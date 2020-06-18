#include "vulkan_pipe_settings.h"

void delete_vulkan_pipe_settings(struct vulkan_pipe_settings *settings) {
    for (uint32_t i = 0; i < settings->number_of_sets; i++) {
        free(settings->sets[i].items);
    }
    free(settings->sets);
}
