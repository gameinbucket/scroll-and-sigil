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

    uint32_t count = vk_state->swapchain_image_count;

    vk_state->vk_uniform_buffers = safe_calloc(count, sizeof(VkBuffer));
    vk_state->vk_uniform_buffers_memory = safe_calloc(count, sizeof(VkDeviceMemory));

    VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT;
    VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    for (uint32_t i = 0; i < count; i++) {
        vk_create_buffer(vk_state, size, usage, properties, &vk_state->vk_uniform_buffers[i], &vk_state->vk_uniform_buffers_memory[i]);
    }
}

void vk_update_uniform_buffer(vulkan_state *vk_state, uint32_t current_image) {

    struct uniform_buffer_object ubo = {0};

    float view[16];
    float perspective[16];

    static float x = 0.0f;

    x += 0.001f;

    vec3 eye = {3 + x, 3, 5};
    vec3 center = {0, 0, 0};
    matrix_look_at(view, &eye, &center);
    matrix_translate(view, -eye.x, -eye.y, -eye.z);

    float ratio = (float)vk_state->swapchain_extent.width / (float)vk_state->swapchain_extent.height;

    matrix_perspective(perspective, 60.0, 0.01, 100, ratio);

    matrix_multiply(ubo.mvp, perspective, view);

    void *data;
    vkMapMemory(vk_state->vk_device, vk_state->vk_uniform_buffers_memory[current_image], 0, sizeof(ubo), 0, &data);
    memcpy(data, &ubo, sizeof(ubo));
    vkUnmapMemory(vk_state->vk_device, vk_state->vk_uniform_buffers_memory[current_image]);
}

void vk_create_descriptor_pool(vulkan_state *vk_state) {

    uint32_t size = vk_state->swapchain_image_count;

    VkDescriptorPoolSize pool_size = {0};
    pool_size.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    pool_size.descriptorCount = size;

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = 1;
    pool_info.pPoolSizes = &pool_size;
    pool_info.maxSets = size;

    if (vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &vk_state->vk_descriptor_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Pool\n");
        exit(1);
    }
}

void vk_create_descriptor_sets(vulkan_state *vk_state) {

    uint32_t size = vk_state->swapchain_image_count;

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(size, sizeof(VkDescriptorSetLayout));

    for (uint32_t i = 0; i < size; i++) {
        memcpy(&descriptor_set_layouts[i], &vk_state->vk_descriptor_set_layout, sizeof(VkDescriptorSetLayout));
    }

    VkDescriptorSetAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    alloc_info.descriptorPool = vk_state->vk_descriptor_pool;
    alloc_info.descriptorSetCount = size;
    alloc_info.pSetLayouts = descriptor_set_layouts;

    vk_state->vk_descriptor_sets = safe_calloc(size, sizeof(VkDescriptorSet));

    if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, vk_state->vk_descriptor_sets) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Descriptor Sets\n");
        exit(1);
    }

    free(descriptor_set_layouts);

    for (uint32_t i = 0; i < size; i++) {

        VkDescriptorBufferInfo buffer_info = {0};
        buffer_info.buffer = vk_state->vk_uniform_buffers[i];
        buffer_info.offset = 0;
        buffer_info.range = sizeof(struct uniform_buffer_object);

        VkWriteDescriptorSet descriptor_write = {0};
        descriptor_write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
        descriptor_write.dstSet = vk_state->vk_descriptor_sets[i];
        descriptor_write.dstBinding = 0;
        descriptor_write.dstArrayElement = 0;
        descriptor_write.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        descriptor_write.descriptorCount = 1;
        descriptor_write.pBufferInfo = &buffer_info;

        vkUpdateDescriptorSets(vk_state->vk_device, 1, &descriptor_write, 0, NULL);
    }
}
