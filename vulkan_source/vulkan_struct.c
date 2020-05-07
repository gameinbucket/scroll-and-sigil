#include "vulkan_struct.h"

void delete_vulkan_render_buffer(vulkan_state *vk_state, struct vulkan_render_buffer *self) {

    vkDestroyBuffer(vk_state->vk_device, self->vk_vertex_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_vertex_buffer_memory, NULL);

    vkDestroyBuffer(vk_state->vk_device, self->vk_index_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_index_buffer_memory, NULL);

    free(self->vertices);
    free(self->indices);
    free(self);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *self) {

    delete_vulkan_render_buffer(vk_state, self->rendering);
    free(self);
}

void delete_vulkan_swapchain(struct vulkan_swapchain *self) {

    free(self->swapchain_images);
    free(self->swapchain_image_views);
    free(self);
}

void delete_vulkan_uniform_buffer(struct vulkan_uniform_buffer *self) {

    free(self->vk_uniform_buffers);
    free(self->vk_uniform_buffers_memory);
    free(self);
}
