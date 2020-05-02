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

    VkVertexInputAttributeDescription *description = safe_malloc(count * sizeof(VkVertexInputAttributeDescription));

    uint32_t i = 0;
    uint32_t offset = 0;

    if (position > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(position);
        description[i].offset = offset;
        i++;
        offset += position;
    }

    if (color > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(color);
        description[i].offset = offset;
        i++;
        offset += color;
    }

    if (texture > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(texture);
        description[i].offset = offset;
        i++;
        offset += texture;
    }

    if (normal > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(normal);
        description[i].offset = offset;
        i++;
    }

    return description;
}
