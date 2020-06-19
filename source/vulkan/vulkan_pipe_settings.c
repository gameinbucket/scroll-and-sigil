#include "vulkan_pipe_settings.h"

static void delete_vulkan_pipe_item(struct vulkan_pipe_item *item) {
    free(item->images);
}

static void delete_vulkan_pipe_set(struct vulkan_pipe_set *set) {
    for (uint32_t i = 0; i < set->item_count; i++) {
        delete_vulkan_pipe_item(&set->items[i]);
    }
    free(set->items);
}

void delete_vulkan_pipe_settings(struct vulkan_pipe_settings *settings) {
    for (uint32_t i = 0; i < settings->number_of_sets; i++) {
        delete_vulkan_pipe_set(&settings->sets[i]);
    }
    free(settings->sets);
}
