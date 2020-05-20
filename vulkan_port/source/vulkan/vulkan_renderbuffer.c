#include "vulkan_renderbuffer.h"

struct vulkan_renderbuffer *vk_create_renderbuffer(int position, int color, int texture, int normal, size_t vertices, size_t indices) {
    struct vulkan_renderbuffer *self = safe_calloc(1, sizeof(struct vulkan_renderbuffer));
    self->position = position;
    self->color = color;
    self->texture = texture;
    self->normal = normal;
    self->stride = self->position + self->color + self->texture + self->normal;
    self->vertices = safe_malloc(vertices * self->stride * sizeof(float));
    self->indices = safe_malloc(indices * sizeof(uint32_t));
    self->vertex_count = vertices;
    self->index_count = indices;
    return self;
}

void vulkan_renderbuffer_zero(struct vulkan_renderbuffer *self) {
    self->vertex_position = 0;
    self->index_position = 0;
    self->index_offset = 0;
}

void delete_vulkan_renderbuffer(vulkan_state *vk_state, struct vulkan_renderbuffer *self) {
    vkDestroyBuffer(vk_state->vk_device, self->vk_vertex_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_vertex_buffer_memory, NULL);
    vkDestroyBuffer(vk_state->vk_device, self->vk_index_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_index_buffer_memory, NULL);
    free(self->vertices);
    free(self->indices);
    free(self);
}
