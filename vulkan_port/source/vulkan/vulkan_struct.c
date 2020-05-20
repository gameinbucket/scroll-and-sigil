#include "vulkan_struct.h"

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
