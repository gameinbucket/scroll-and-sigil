#include "vulkan_uniforms.h"

void vk_create_descriptor_set_layout(vulkan_state *vk_state) {

    VkDescriptorSetLayoutBinding ubo_layout_binding = {0};
    ubo_layout_binding.binding = 0;
    ubo_layout_binding.descriptorCount = 1;
    ubo_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    ubo_layout_binding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;

    VkDescriptorSetLayoutCreateInfo layout_info = {0};
    layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    layout_info.bindingCount = 1;
    layout_info.pBindings = &ubo_layout_binding;

    if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &vk_state->vk_descriptor_set_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
        exit(1);
    }
}

void vk_create_uniform_buffers(vulkan_state *vk_state) {

    VkDeviceSize size = sizeof(struct uniform_buffer_object);

    vk_state->uniform_buffers = safe_calloc(vk_state->swapchain_image_count, sizeof(VkBuffer));
    vk_state->uniform_buffers_memory = safe_calloc(vk_state->swapchain_image_count, sizeof(VkDeviceMemory));

    VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT;
    VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    for (uint32_t i = 0; i < vk_state->swapchain_image_count; i++) {
        vk_create_buffer(vk_state, size, usage, properties, &vk_state->uniform_buffers[i], &vk_state->uniform_buffers_memory[i]);
    }
}

void vk_update_uniform_buffer(vulkan_state *vk_state, uint32_t current_image) {

    struct uniform_buffer_object ubo = {0};

    float view[16];
    float perspective[16];

    vec3 eye = {2, 2, 2};
    vec3 center = {0, 0, 0};
    matrix_look_at(view, &eye, &center);

    matrix_perspective(perspective, 60.0, 0.01, 100, (float)vk_state->swapchain_extent.width / (float)vk_state->swapchain_extent.height);

    matrix_multiply(ubo.mvp, perspective, view);

    void *data;
    vkMapMemory(vk_state->vk_device, vk_state->uniform_buffers_memory[current_image], 0, sizeof(ubo), 0, &data);
    memcpy(data, &ubo, sizeof(ubo));
    vkUnmapMemory(vk_state->vk_device, vk_state->uniform_buffers_memory[current_image]);
}
