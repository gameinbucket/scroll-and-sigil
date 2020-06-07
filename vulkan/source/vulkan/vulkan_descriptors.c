#include "vulkan_descriptors.h"

static void descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    uint32_t size = pipeline->swapchain_image_count;

    uint32_t bind_count = 1 + pipeline->image_count;
    VkDescriptorPoolSize *pool_sizes = safe_malloc(bind_count * sizeof(VkDescriptorPoolSize));

    VkDescriptorPoolSize pool_size_uniform = {0};
    pool_size_uniform.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    pool_size_uniform.descriptorCount = size;

    pool_sizes[0] = pool_size_uniform;

    for (int k = 0; k < pipeline->image_count; k++) {

        VkDescriptorPoolSize pool_size_sampler = {0};
        pool_size_sampler.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        pool_size_sampler.descriptorCount = size;

        pool_sizes[k] = pool_size_sampler;
    }

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = bind_count;
    pool_info.pPoolSizes = pool_sizes;
    pool_info.maxSets = size;

    if (vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &pipeline->vk_descriptor_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Pool\n");
        exit(1);
    }

    free(pool_sizes);
}

static void descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    uint32_t size = pipeline->swapchain_image_count;

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(size, sizeof(VkDescriptorSetLayout));

    for (uint32_t i = 0; i < size; i++) {
        memcpy(&descriptor_set_layouts[i], &pipeline->vk_descriptor_set_layout, sizeof(VkDescriptorSetLayout));
    }

    VkDescriptorSetAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    alloc_info.descriptorPool = pipeline->vk_descriptor_pool;
    alloc_info.descriptorSetCount = size;
    alloc_info.pSetLayouts = descriptor_set_layouts;

    pipeline->vk_descriptor_sets = safe_calloc(size, sizeof(VkDescriptorSet));

    if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, pipeline->vk_descriptor_sets) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Descriptor Sets\n");
        exit(1);
    }

    free(descriptor_set_layouts);

    uint32_t total_bindings = 1 + pipeline->image_count;
    VkWriteDescriptorSet *descriptor_writes = safe_malloc(total_bindings * sizeof(VkWriteDescriptorSet));

    for (uint32_t i = 0; i < size; i++) {

        uint32_t binding = 0;

        VkDescriptorBufferInfo buffer_info = {0};
        buffer_info.buffer = pipeline->uniforms->vk_uniform_buffers[i];
        buffer_info.offset = 0;
        buffer_info.range = sizeof(struct uniform_buffer_object);

        VkWriteDescriptorSet descriptor_write_uniform = {0};
        descriptor_write_uniform.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
        descriptor_write_uniform.dstSet = pipeline->vk_descriptor_sets[i];
        descriptor_write_uniform.dstBinding = binding++;
        descriptor_write_uniform.dstArrayElement = 0;
        descriptor_write_uniform.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        descriptor_write_uniform.descriptorCount = 1;
        descriptor_write_uniform.pBufferInfo = &buffer_info;

        descriptor_writes[0] = descriptor_write_uniform;

        for (int k = 0; k < pipeline->image_count; k++) {

            VkDescriptorImageInfo image_info = {0};
            image_info.imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            image_info.imageView = pipeline->images[k]->vk_texture_image_view;
            image_info.sampler = pipeline->images[k]->vk_texture_sampler;

            VkWriteDescriptorSet descriptor_write_sampler = {0};
            descriptor_write_sampler.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            descriptor_write_sampler.dstSet = pipeline->vk_descriptor_sets[i];
            descriptor_write_sampler.dstBinding = binding;
            descriptor_write_sampler.dstArrayElement = 0;
            descriptor_write_sampler.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
            descriptor_write_sampler.descriptorCount = 1;
            descriptor_write_sampler.pImageInfo = &image_info;

            descriptor_writes[binding] = descriptor_write_sampler;

            binding++;
        }

        vkUpdateDescriptorSets(vk_state->vk_device, total_bindings, descriptor_writes, 0, NULL);
    }

    free(descriptor_writes);
}

void vk_create_descriptors(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {
    descriptor_pool(vk_state, pipeline);
    descriptor_sets(vk_state, pipeline);
}
