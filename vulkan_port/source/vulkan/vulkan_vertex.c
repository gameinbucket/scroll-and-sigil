#include "vulkan_vertex.h"

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

void vk_create_vertex_buffer(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_render_buffer *vk_render_data) {

    VkDeviceSize size = vk_render_data->vertex_count * vk_render_data->vertex_stride * sizeof(vk_render_data->vertices[0]);

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, size, 0, &data);
    memcpy(data, vk_render_data->vertices, (size_t)size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    VkBufferUsageFlagBits vertex_usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT;
    VkMemoryPropertyFlagBits vertex_properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_buffer(vk_state, size, vertex_usage, vertex_properties, &vk_render_data->vk_vertex_buffer, &vk_render_data->vk_vertex_buffer_memory);

    vk_copy_buffer(vk_state, vk_renderer, staging_buffer, vk_render_data->vk_vertex_buffer, size);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);
}

void vk_create_index_buffer(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_render_buffer *vk_render_data) {

    VkDeviceSize size = vk_render_data->index_count * sizeof(vk_render_data->indices[0]);

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, size, 0, &data);
    memcpy(data, vk_render_data->indices, (size_t)size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    VkBufferUsageFlagBits index_usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_INDEX_BUFFER_BIT;
    VkMemoryPropertyFlagBits index_properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_buffer(vk_state, size, index_usage, index_properties, &vk_render_data->vk_index_buffer, &vk_render_data->vk_index_buffer_memory);

    vk_copy_buffer(vk_state, vk_renderer, staging_buffer, vk_render_data->vk_index_buffer, size);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);
}

void vk_create_render_buffers(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_render_buffer *vk_render_data) {

    vk_create_vertex_buffer(vk_state, vk_renderer, vk_render_data);
    vk_create_index_buffer(vk_state, vk_renderer, vk_render_data);
}
