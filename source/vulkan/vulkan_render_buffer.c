#include "vulkan_render_buffer.h"

void vulkan_render_buffer_draw(struct vulkan_render_buffer *render, VkCommandBuffer command_buffer) {

    VkBuffer vertex_buffers[1] = {render->vk_vertex_buffer};
    VkDeviceSize vertex_offsets[1] = {0};

    vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);
    vkCmdBindIndexBuffer(command_buffer, render->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

    vkCmdDrawIndexed(command_buffer, render->index_position, 1, 0, 0, 0);
}

static void create_vertex_buffer(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *renderbuffer) {

    VkDeviceSize max_size = renderbuffer->vertex_max * renderbuffer->settings.stride * sizeof(float);

    // size_t active_size = renderbuffer->vertex_position * sizeof(uint32_t);

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, max_size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, max_size, 0, &data);
    memcpy(data, renderbuffer->vertices, (size_t)max_size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    VkBufferUsageFlagBits vertex_usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT;
    VkMemoryPropertyFlagBits vertex_properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_buffer(vk_state, max_size, vertex_usage, vertex_properties, &renderbuffer->vk_vertex_buffer, &renderbuffer->vk_vertex_buffer_memory);

    vk_copy_buffer(vk_state, command_pool, staging_buffer, renderbuffer->vk_vertex_buffer, max_size);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);
}

static void create_index_buffer(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *renderbuffer) {

    VkDeviceSize max_size = renderbuffer->index_max * sizeof(uint32_t);

    // size_t active_size = renderbuffer->index_position * sizeof(uint32_t);

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, max_size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, max_size, 0, &data);
    memcpy(data, renderbuffer->indices, (size_t)max_size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    VkBufferUsageFlagBits index_usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_INDEX_BUFFER_BIT;
    VkMemoryPropertyFlagBits index_properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_buffer(vk_state, max_size, index_usage, index_properties, &renderbuffer->vk_index_buffer, &renderbuffer->vk_index_buffer_memory);

    vk_copy_buffer(vk_state, command_pool, staging_buffer, renderbuffer->vk_index_buffer, max_size);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);
}

void vulkan_render_buffer_zero(struct vulkan_render_buffer *self) {
    self->vertex_position = 0;
    self->index_position = 0;
    self->index_offset = 0;
}

void vulkan_render_buffer_update(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *self) {

    printf("vulkan render buffer update %p %p %p\n", (void *)vk_state, (void *)command_pool, (void *)self);
}

void vulkan_render_buffer_initialize(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *self) {

    create_vertex_buffer(vk_state, command_pool, self);
    create_index_buffer(vk_state, command_pool, self);
}

struct vulkan_render_buffer *create_vulkan_renderbuffer(struct vulkan_render_settings settings, size_t vertices, size_t indices) {
    struct vulkan_render_buffer *self = safe_calloc(1, sizeof(struct vulkan_render_buffer));
    self->settings = settings;
    self->vertices = safe_malloc(vertices * settings.stride * sizeof(float));
    self->indices = safe_malloc(indices * sizeof(uint32_t));
    self->vertex_max = vertices;
    self->index_max = indices;
    return self;
}

void delete_vulkan_renderbuffer(vulkan_state *vk_state, struct vulkan_render_buffer *self) {

    printf("delete vulkan render buffer %p\n", (void *)self);

    vkDestroyBuffer(vk_state->vk_device, self->vk_vertex_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_vertex_buffer_memory, NULL);
    vkDestroyBuffer(vk_state->vk_device, self->vk_index_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_index_buffer_memory, NULL);

    free(self->vertices);
    free(self->indices);
    free(self);
}
