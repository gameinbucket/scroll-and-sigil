#include "vulkan_render_settings.h"

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

int vk_attribute_count(struct vulkan_render_settings *settings) {
    int count = 0;
    if (settings->position > 0)
        count++;
    if (settings->color > 0)
        count++;
    if (settings->texture > 0)
        count++;
    if (settings->normal > 0)
        count++;
    if (settings->bone > 0)
        count++;
    return count;
}

VkVertexInputBindingDescription vk_binding_description(struct vulkan_render_settings *settings) {
    VkVertexInputBindingDescription description = {0};
    description.binding = 0;
    description.stride = settings->stride * sizeof(float);
    description.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
    return description;
}

VkVertexInputAttributeDescription *vk_attribute_description(struct vulkan_render_settings *settings) {

    int count = vk_attribute_count(settings);

    VkVertexInputAttributeDescription *description = safe_calloc(count, sizeof(VkVertexInputAttributeDescription));

    uint32_t i = 0;
    uint32_t offset = 0;

    if (settings->position > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(settings->position);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += settings->position;
    }

    if (settings->color > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(settings->color);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += settings->color;
    }

    if (settings->texture > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(settings->texture);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += settings->texture;
    }

    if (settings->normal > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(settings->normal);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += settings->normal;
    }

    if (settings->bone > 0) {
        description[i].binding = 0;
        description[i].location = i;
        description[i].format = vk_vertex_format(settings->bone);
        description[i].offset = offset * sizeof(float);
        i++;
        offset += settings->bone;
    }

    return description;
}

void vulkan_render_settings_init(struct vulkan_render_settings *self, int position, int color, int texture, int normal, int bone) {
    self->position = position;
    self->color = color;
    self->texture = texture;
    self->normal = normal;
    self->bone = bone;
    self->stride = self->position + self->color + self->texture + self->normal + self->bone;
}
