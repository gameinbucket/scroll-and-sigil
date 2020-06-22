#include "vulkan_descriptors.h"

// void vk_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     uint32_t size = pipeline->swapchain_image_count * (1 + pipeline->image_descriptors);

//     uint32_t bind_count = 1 + pipeline->image_count;
//     VkDescriptorPoolSize *pool_sizes = safe_malloc(bind_count * sizeof(VkDescriptorPoolSize));

//     VkDescriptorPoolSize pool_size_uniform = {0};
//     pool_size_uniform.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
//     pool_size_uniform.descriptorCount = size;

//     pool_sizes[0] = pool_size_uniform;

//     uint32_t binding = 1;

//     for (int k = 0; k < pipeline->image_count; k++) {

//         VkDescriptorPoolSize pool_size_sampler = {0};
//         pool_size_sampler.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
//         pool_size_sampler.descriptorCount = size;

//         pool_sizes[binding] = pool_size_sampler;
//         binding++;
//     }

//     VkDescriptorPoolCreateInfo pool_info = {0};
//     pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
//     pool_info.poolSizeCount = bind_count;
//     pool_info.pPoolSizes = pool_sizes;
//     pool_info.maxSets = size;

//     if (vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &pipeline->vk_descriptor_pool) != VK_SUCCESS) {
//         fprintf(stderr, "Error: Vulkan Create Descriptor Pool\n");
//         exit(1);
//     }

//     free(pool_sizes);
// }

// void vk_create_uniform_buffer_descriptor_set_layout(vulkan_state *vk_state, VkDescriptorSetLayout *vk_descriptor_set_layout) {

//     VkDescriptorSetLayoutBinding ubo_layout_binding = {0};
//     ubo_layout_binding.binding = 0;
//     ubo_layout_binding.descriptorCount = 1;
//     ubo_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
//     ubo_layout_binding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;

//     VkDescriptorSetLayoutBinding bindings[1] = {ubo_layout_binding};

//     VkDescriptorSetLayoutCreateInfo layout_info = {0};
//     layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
//     layout_info.bindingCount = 1;
//     layout_info.pBindings = bindings;

//     if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, vk_descriptor_set_layout) != VK_SUCCESS) {
//         fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
//         exit(1);
//     }
// }

// void vk_create_image_descriptor_set_layout(vulkan_state *vk_state, uint32_t image_count, VkDescriptorSetLayout *vk_descriptor_set_layout) {

//     VkDescriptorSetLayoutBinding *bindings = safe_malloc(image_count * sizeof(VkDescriptorSetLayoutBinding));

//     uint32_t binding = 0;

//     for (uint32_t i = 0; i < image_count; i++) {

//         VkDescriptorSetLayoutBinding sampler_layout_binding = {0};
//         sampler_layout_binding.binding = binding;
//         sampler_layout_binding.descriptorCount = 1;
//         sampler_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
//         sampler_layout_binding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

//         bindings[binding] = sampler_layout_binding;

//         binding++;
//     }

//     VkDescriptorSetLayoutCreateInfo layout_info = {0};
//     layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
//     layout_info.bindingCount = image_count;
//     layout_info.pBindings = bindings;

//     if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, vk_descriptor_set_layout) != VK_SUCCESS) {
//         fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
//         exit(1);
//     }

//     free(bindings);
// }

// void vk_create_multi_descriptor_set_layout(vulkan_state *vk_state, uint32_t image_count, VkDescriptorSetLayout *vk_descriptor_set_layout) {

//     uint32_t binding_count = 1 + image_count;

//     VkDescriptorSetLayoutBinding *bindings = safe_malloc(binding_count * sizeof(VkDescriptorSetLayoutBinding));

//     VkDescriptorSetLayoutBinding ubo_layout_binding = {0};
//     ubo_layout_binding.binding = 0;
//     ubo_layout_binding.descriptorCount = 1;
//     ubo_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
//     ubo_layout_binding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;

//     bindings[0] = ubo_layout_binding;

//     uint32_t binding = 1;

//     for (uint32_t i = 0; i < image_count; i++) {

//         VkDescriptorSetLayoutBinding sampler_layout_binding = {0};
//         sampler_layout_binding.binding = binding;
//         sampler_layout_binding.descriptorCount = 1;
//         sampler_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
//         sampler_layout_binding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

//         bindings[binding] = sampler_layout_binding;

//         binding++;
//     }

//     VkDescriptorSetLayoutCreateInfo layout_info = {0};
//     layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
//     layout_info.bindingCount = binding_count;
//     layout_info.pBindings = bindings;

//     if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, vk_descriptor_set_layout) != VK_SUCCESS) {
//         fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
//         exit(1);
//     }

//     free(bindings);
// }

// void vk_create_uniform_buffer_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     uint32_t size = pipeline->swapchain_image_count;

//     VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(size, sizeof(VkDescriptorSetLayout));

//     for (uint32_t i = 0; i < size; i++) {
//         memcpy(&descriptor_set_layouts[i], &pipeline->vk_uniform_buffer_descriptor_set_layout, sizeof(VkDescriptorSetLayout));
//     }

//     VkDescriptorSetAllocateInfo alloc_info = {0};
//     alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
//     alloc_info.descriptorPool = pipeline->vk_descriptor_pool;
//     alloc_info.descriptorSetCount = size;
//     alloc_info.pSetLayouts = descriptor_set_layouts;

//     pipeline->vk_uniform_buffer_descriptor_sets = safe_calloc(size, sizeof(VkDescriptorSet));

//     if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, pipeline->vk_uniform_buffer_descriptor_sets) != VK_SUCCESS) {
//         fprintf(stderr, "Error: Vulkan Allocate Descriptor Sets\n");
//         exit(1);
//     }

//     free(descriptor_set_layouts);
// }

// void vk_create_image_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     uint32_t size = pipeline->swapchain_image_count * pipeline->image_descriptors;

//     VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(size, sizeof(VkDescriptorSetLayout));

//     for (uint32_t i = 0; i < size; i++) {
//         memcpy(&descriptor_set_layouts[i], &pipeline->vk_image_descriptor_set_layout, sizeof(VkDescriptorSetLayout));
//     }

//     VkDescriptorSetAllocateInfo alloc_info = {0};
//     alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
//     alloc_info.descriptorPool = pipeline->vk_descriptor_pool;
//     alloc_info.descriptorSetCount = size;
//     alloc_info.pSetLayouts = descriptor_set_layouts;

//     pipeline->vk_image_descriptor_sets = safe_calloc(size, sizeof(VkDescriptorSet));

//     if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, pipeline->vk_image_descriptor_sets) != VK_SUCCESS) {
//         fprintf(stderr, "Error: Vulkan Allocate Descriptor Sets\n");
//         exit(1);
//     }

//     free(descriptor_set_layouts);
// }

// void vk_update_uniform_buffer_descriptor_set(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index) {

//     VkDescriptorBufferInfo buffer_info = {0};
//     buffer_info.buffer = pipeline->uniforms->vk_uniform_buffers[image_index];
//     buffer_info.offset = 0;
//     buffer_info.range = sizeof(struct uniform_buffer_projection);

//     VkWriteDescriptorSet descriptor_write_uniform = {0};
//     descriptor_write_uniform.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
//     descriptor_write_uniform.dstSet = pipeline->vk_uniform_buffer_descriptor_sets[image_index];
//     descriptor_write_uniform.dstBinding = 0;
//     descriptor_write_uniform.dstArrayElement = 0;
//     descriptor_write_uniform.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
//     descriptor_write_uniform.descriptorCount = 1;
//     descriptor_write_uniform.pBufferInfo = &buffer_info;

//     VkWriteDescriptorSet descriptor_writes[1] = {descriptor_write_uniform};

//     vkUpdateDescriptorSets(vk_state->vk_device, 1, descriptor_writes, 0, NULL);
// }

// void vk_update_uniform_buffer_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     uint32_t size = pipeline->swapchain_image_count;

//     for (uint32_t i = 0; i < size; i++) {
//         vk_update_uniform_buffer_descriptor_set(vk_state, pipeline, i);
//     }
// }

// void vk_update_image_descriptor_set(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index, uint32_t sample_index) {

//     VkDescriptorSet vk_descriptor_set = pipeline->vk_image_descriptor_sets[image_index * pipeline->image_descriptors + sample_index];

//     uint32_t binding = 0;
//     uint32_t image_count = pipeline->image_count;

//     VkDescriptorImageInfo *image_info = safe_calloc(image_count, sizeof(VkDescriptorImageInfo));
//     VkWriteDescriptorSet *descriptor_write_sampler = safe_calloc(image_count, sizeof(VkWriteDescriptorSet));
//     VkWriteDescriptorSet *descriptor_writes = safe_malloc(image_count * sizeof(VkWriteDescriptorSet));

//     for (uint32_t k = 0; k < image_count; k++) {

//         int image_view_index = sample_index * pipeline->image_count + k;
//         struct vulkan_image *image = pipeline->images[image_view_index];

//         image_info[k].imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
//         image_info[k].imageView = image->vk_texture_image_view;
//         image_info[k].sampler = image->vk_texture_sampler;

//         descriptor_write_sampler[k].sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
//         descriptor_write_sampler[k].dstSet = vk_descriptor_set;
//         descriptor_write_sampler[k].dstBinding = binding;
//         descriptor_write_sampler[k].dstArrayElement = 0;
//         descriptor_write_sampler[k].descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
//         descriptor_write_sampler[k].descriptorCount = 1;
//         descriptor_write_sampler[k].pImageInfo = &image_info[k];

//         descriptor_writes[binding] = descriptor_write_sampler[k];

//         binding++;
//     }

//     vkUpdateDescriptorSets(vk_state->vk_device, image_count, descriptor_writes, 0, NULL);

//     free(descriptor_writes);
//     free(descriptor_write_sampler);
//     free(image_info);
// }

// void vk_update_image_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     for (uint32_t image_index = 0; image_index < pipeline->swapchain_image_count; image_index++) {
//         for (uint32_t sample_index = 0; sample_index < pipeline->image_descriptors; sample_index++) {
//             vk_update_image_descriptor_set(vk_state, pipeline, image_index, sample_index);
//         }
//     }
// }

// void vk_create_descriptor_set_layouts(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     vk_create_uniform_buffer_descriptor_set_layout(vk_state, &pipeline->vk_uniform_buffer_descriptor_set_layout);
//     if (pipeline->image_count > 0) {
//         vk_create_image_descriptor_set_layout(vk_state, pipeline->image_count, &pipeline->vk_image_descriptor_set_layout);
//     }
// }

// void vk_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     vk_create_uniform_buffer_descriptor_sets(vk_state, pipeline);
//     if (pipeline->image_count > 0) {
//         vk_create_image_descriptor_sets(vk_state, pipeline);
//     }
// }

// void vk_update_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

//     vk_update_uniform_buffer_descriptor_sets(vk_state, pipeline);
//     if (pipeline->image_count > 0) {
//         vk_update_image_descriptor_sets(vk_state, pipeline);
//     }
// }

///////////////////////////////////////////////////////////////////////////////

static void create_descriptor_set_layout(vulkan_state *vk_state, struct vulkan_pipe_set *pipe_set) {

    if (pipe_set->number_of_items == 0 || pipe_set->number_of_copies == 0) {
        fprintf(stderr, "Error: Incomplete Pipe Set\n");
        exit(1);
    }

    uint32_t count = pipe_set->number_of_items;

    VkDescriptorSetLayoutBinding *bindings = safe_calloc(count, sizeof(VkDescriptorSetLayoutBinding));

    for (uint32_t i = 0; i < count; i++) {

        struct vulkan_pipe_item *item = &pipe_set->items[i];

        if (item->count == 0) {
            fprintf(stderr, "Error: Incomplete Pipe Item\n");
            exit(1);
        }

        VkDescriptorSetLayoutBinding layout_binding = {0};
        layout_binding.binding = i;
        layout_binding.descriptorCount = item->count;
        layout_binding.descriptorType = item->type;
        layout_binding.stageFlags = item->stages;

        bindings[i] = layout_binding;
    }

    VkDescriptorSetLayoutCreateInfo layout_info = {0};
    layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    layout_info.bindingCount = count;
    layout_info.pBindings = bindings;

    if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &pipe_set->descriptor_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
        exit(1);
    }

    free(bindings);
}

static void allocate_descriptor_sets(vulkan_state *vk_state, VkDescriptorPool descriptor_pool, struct vulkan_pipe_set *pipe_set) {

    uint32_t copies = pipe_set->number_of_copies;

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(copies, sizeof(VkDescriptorSetLayout));

    for (uint32_t i = 0; i < copies; i++) {
        memcpy(&descriptor_set_layouts[i], &pipe_set->descriptor_layout, sizeof(VkDescriptorSetLayout));
    }

    VkDescriptorSetAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    alloc_info.descriptorPool = descriptor_pool;
    alloc_info.descriptorSetCount = copies;
    alloc_info.pSetLayouts = descriptor_set_layouts;

    printf("allocate: pointer %p | copies %d\n", (void *)pipe_set, copies);

    pipe_set->descriptor_sets = safe_calloc(copies, sizeof(VkDescriptorSet));

    if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, pipe_set->descriptor_sets) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Descriptor Sets\n");
        exit(1);
    }

    free(descriptor_set_layouts);
}

static void update_descriptor_set(vulkan_state *vk_state, struct vulkan_pipe_set *pipe_set, uint32_t index) {

    VkDescriptorSet descriptor_set = pipe_set->descriptor_sets[index];

    uint32_t number_of_items = pipe_set->number_of_items;

    VkWriteDescriptorSet *write_descriptor = safe_calloc(number_of_items, sizeof(VkWriteDescriptorSet));

    array *image_info = create_array(0);
    array *buffer_info = create_array(0);

    for (uint32_t i = 0; i < number_of_items; i++) {

        struct vulkan_pipe_item *item = &pipe_set->items[i];

        if (item->uniforms != NULL) {
            struct vulkan_uniform_buffer *uniform = &item->uniforms[0];

            VkDescriptorBufferInfo *info = safe_calloc(1, sizeof(VkDescriptorBufferInfo));
            array_push(buffer_info, info);

            info->buffer = uniform->vk_uniform_buffers[0];
            info->offset = 0;
            info->range = item->byte_size;

            write_descriptor[i].sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write_descriptor[i].dstSet = descriptor_set;
            write_descriptor[i].dstBinding = i;
            write_descriptor[i].dstArrayElement = 0;
            write_descriptor[i].descriptorType = item->type;
            write_descriptor[i].descriptorCount = item->count;
            write_descriptor[i].pBufferInfo = info;

        } else {
            struct vulkan_image *image = item->images[index];

            VkDescriptorImageInfo *info = safe_calloc(1, sizeof(VkDescriptorImageInfo));
            array_push(image_info, info);

            info->imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            info->imageView = image->vk_texture_image_view;
            info->sampler = image->vk_texture_sampler;

            write_descriptor[i].sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write_descriptor[i].dstSet = descriptor_set;
            write_descriptor[i].dstBinding = i;
            write_descriptor[i].dstArrayElement = 0;
            write_descriptor[i].descriptorType = item->type;
            write_descriptor[i].descriptorCount = item->count;
            write_descriptor[i].pImageInfo = info;
        }

        i++;
    }

    vkUpdateDescriptorSets(vk_state->vk_device, 1, write_descriptor, 0, NULL);

    release_array_items(image_info);
    release_array_items(buffer_info);

    delete_array(image_info);
    delete_array(buffer_info);

    free(write_descriptor);
}

static void update_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipe_set *pipe_set) {
    uint32_t copies = pipe_set->number_of_copies;
    for (uint32_t i = 0; i < copies; i++) {
        update_descriptor_set(vk_state, pipe_set, i);
    }
}

void vulkan_pipeline_create_descriptor_layouts(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {
    for (uint32_t i = 0; i < pipeline->pipe_data.number_of_sets; i++) {
        create_descriptor_set_layout(vk_state, &pipeline->pipe_data.sets[i]);
    }
}

void vulkan_pipeline_create_descriptor_pool(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    struct vulkan_pipe_data *pipe_data = &pipeline->pipe_data;

    uint32_t max_sets = 0;
    uint32_t pool_size_count = 0;

    for (uint32_t i = 0; i < pipe_data->number_of_sets; i++) {
        struct vulkan_pipe_set *pipe_set = &pipe_data->sets[i];
        pool_size_count += pipe_set->number_of_items;
    }

    VkDescriptorPoolSize *pool_sizes = safe_malloc(pool_size_count * sizeof(VkDescriptorPoolSize));

    uint32_t pool_index = 0;

    for (uint32_t i = 0; i < pipe_data->number_of_sets; i++) {
        struct vulkan_pipe_set *pipe_set = &pipe_data->sets[i];
        for (uint32_t k = 0; k < pipe_set->number_of_items; k++) {
            struct vulkan_pipe_item *pipe_item = &pipe_set->items[k];
            printf("pool: i %d | k %d | type %d | count %d | copies %d\n", i, k, pipe_item->type, pipe_item->count, pipe_set->number_of_copies);
            VkDescriptorPoolSize pool_size = {0};
            pool_size.type = pipe_item->type;
            pool_size.descriptorCount = pipe_item->count * pipe_set->number_of_copies;
            pool_sizes[pool_index] = pool_size;
            pool_index++;
        }
        max_sets += pipe_set->number_of_copies;
    }

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = pool_size_count;
    pool_info.pPoolSizes = pool_sizes;
    pool_info.maxSets = max_sets;

    if (vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &pipe_data->descriptor_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Pool\n");
        exit(1);
    }

    free(pool_sizes);
}

void vulkan_pipeline_create_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {
    for (uint32_t i = 0; i < pipeline->pipe_data.number_of_sets; i++) {
        allocate_descriptor_sets(vk_state, pipeline->pipe_data.descriptor_pool, &pipeline->pipe_data.sets[i]);
    }
}

void vulkan_pipeline_update_descriptor_sets(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {
    for (uint32_t i = 0; i < pipeline->pipe_data.number_of_sets; i++) {
        update_descriptor_sets(vk_state, &pipeline->pipe_data.sets[i]);
    }
}
