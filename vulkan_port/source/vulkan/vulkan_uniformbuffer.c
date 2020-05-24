#include "vulkan_uniformbuffer.h"

void delete_vulkan_uniform_buffer(struct vulkan_uniformbuffer *self) {
    free(self->vk_uniform_buffers);
    free(self->vk_uniform_buffers_memory);
    free(self);
}
