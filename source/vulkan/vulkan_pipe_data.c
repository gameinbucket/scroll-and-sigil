#include "vulkan_pipe_data.h"

void vulkan_pipe_data_initialize_uniforms(vulkan_state *vk_state, struct vulkan_pipe_data *pipe_data) {
    for (uint32_t i = 0; i < pipe_data->number_of_sets; i++) {
        struct vulkan_pipe_set *pipe_set = &pipe_data->sets[i];
        for (uint32_t i = 0; i < pipe_set->number_of_items; i++) {
            struct vulkan_pipe_item *item = &pipe_set->items[i];
            if (item->type == VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER || item->type == VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC) {
                item->uniforms = safe_calloc(item->count, sizeof(struct vulkan_uniform_buffer));
                item->uniforms->size = item->byte_size;
                vulkan_uniform_buffer_initialize(vk_state, item->count, item->uniforms);
            }
        }
    }
}

static void vulkan_pipe_item_clean(vulkan_state *vk_state, struct vulkan_pipe_item *pipe_item) {
    if (pipe_item->uniforms != NULL) {
        vulkan_uniform_buffer_clean(vk_state, pipe_item->uniforms);
    }
}

static void vulkan_pipe_set_clean(vulkan_state *vk_state, struct vulkan_pipe_set *pipe_set) {
    for (uint32_t i = 0; i < pipe_set->number_of_items; i++) {
        vulkan_pipe_item_clean(vk_state, &pipe_set->items[i]);
    }
}

void vulkan_pipe_data_clean(vulkan_state *vk_state, struct vulkan_pipe_data *pipe_data) {
    for (uint32_t i = 0; i < pipe_data->number_of_sets; i++) {
        vulkan_pipe_set_clean(vk_state, &pipe_data->sets[i]);
    }
    vkDestroyDescriptorPool(vk_state->vk_device, pipe_data->descriptor_pool, NULL);
}

static void delete_vulkan_pipe_item(struct vulkan_pipe_item *pipe_item) {
    free(pipe_item->uniforms);
    free(pipe_item->images);
}

static void delete_vulkan_pipe_set(vulkan_state *vk_state, struct vulkan_pipe_set *pipe_set) {
    for (uint32_t i = 0; i < pipe_set->number_of_items; i++) {
        delete_vulkan_pipe_item(&pipe_set->items[i]);
    }
    vkDestroyDescriptorSetLayout(vk_state->vk_device, pipe_set->descriptor_layout, NULL);
    free(pipe_set->descriptor_sets);
    free(pipe_set->items);
}

void delete_vulkan_pipe_data(vulkan_state *vk_state, struct vulkan_pipe_data *pipe_data) {
    for (uint32_t i = 0; i < pipe_data->number_of_sets; i++) {
        delete_vulkan_pipe_set(vk_state, &pipe_data->sets[i]);
    }
    free(pipe_data->sets);
}
