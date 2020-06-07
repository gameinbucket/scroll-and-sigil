#include "vulkan_renderbuffer.h"

static VkFormat vk_vertex_format(int floats) {
    switch (floats) {
    case 1: return VK_FORMAT_R32_SFLOAT;
    case 2: return VK_FORMAT_R32G32_SFLOAT;
    case 3: return VK_FORMAT_R32G32B32_SFLOAT;
    case 4: return VK_FORMAT_R32G32B32A32_SFLOAT;
    }
    fprintf(stderr, "Error: vertex format not supported\n");
    exit(1);
}

int vk_attribute_count(int position, int color, int texture, int normal) {
    int count = 0;
    if (position > 0)
        count++;
    if (color > 0)
        count++;
    if (texture > 0)
        count++;
    if (normal > 0)
        count++;
    return count;
}

VkVertexInputBindingDescription vk_binding_description(int position, int color, int texture, int normal) {
    int stride = position + color + texture + normal;
    VkVertexInputBindingDescription description = {0};
    description.binding = 0;
    description.stride = stride * sizeof(float);
    description.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
    return description;
}

VkVertexInputAttributeDescription *vk_attribute_description(int position, int color, int texture, int normal) {

    int count = vk_attribute_count(position, color, texture, normal);

    VkVertexInputAttributeDescription *description = safe_calloc(count, sizeof(VkVertexInputAttributeDescription));

    uint32_t i = 0;
    uint32_t offset = 0;

    if (position > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(position);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += position;
    }

    if (color > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(color);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += color;
    }

    if (texture > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(texture);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += texture;
    }

    if (normal > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(normal);
        description[i].offset = offset * sizeof(float);
        i++;
    }

    return description;
}

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

    printf("delete vulkan render buffer %p\n", (void *)self);

    vkDestroyBuffer(vk_state->vk_device, self->vk_vertex_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_vertex_buffer_memory, NULL);
    vkDestroyBuffer(vk_state->vk_device, self->vk_index_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, self->vk_index_buffer_memory, NULL);

    free(self->vertices);
    free(self->indices);
    free(self);
}

static void create_vertex_buffer(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_renderbuffer *renderbuffer) {

    VkDeviceSize size = renderbuffer->vertex_count * renderbuffer->stride * sizeof(float);

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, size, 0, &data);
    memcpy(data, renderbuffer->vertices, (size_t)size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    VkBufferUsageFlagBits vertex_usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT;
    VkMemoryPropertyFlagBits vertex_properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_buffer(vk_state, size, vertex_usage, vertex_properties, &renderbuffer->vk_vertex_buffer, &renderbuffer->vk_vertex_buffer_memory);

    vk_copy_buffer(vk_state, command_pool, staging_buffer, renderbuffer->vk_vertex_buffer, size);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);
}

static void create_index_buffer(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_renderbuffer *renderbuffer) {

    VkDeviceSize size = renderbuffer->index_count * sizeof(uint32_t);

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, size, 0, &data);
    memcpy(data, renderbuffer->indices, (size_t)size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    VkBufferUsageFlagBits index_usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_INDEX_BUFFER_BIT;
    VkMemoryPropertyFlagBits index_properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_buffer(vk_state, size, index_usage, index_properties, &renderbuffer->vk_index_buffer, &renderbuffer->vk_index_buffer_memory);

    vk_copy_buffer(vk_state, command_pool, staging_buffer, renderbuffer->vk_index_buffer, size);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);
}

void vulkan_renderbuffer_update_data(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_renderbuffer *renderbuffer) {

    create_vertex_buffer(vk_state, command_pool, renderbuffer);
    create_index_buffer(vk_state, command_pool, renderbuffer);
}
