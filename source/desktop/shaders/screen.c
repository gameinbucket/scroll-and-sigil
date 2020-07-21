#include "screen.h"

struct screen_shader *new_screen_shader(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    struct screen_shader *screen = safe_calloc(1, sizeof(struct screen_shader));

    uint32_t swapchain_copies = vk_base->swapchain->swapchain_image_count;

    // uniforms

    struct vulkan_uniform_buffer *uniforms_1 = safe_calloc(1, sizeof(struct vulkan_uniform_buffer));
    uniforms_1->object_size = sizeof(struct uniform_projection);
    vulkan_uniform_buffer_initialize(vk_state, swapchain_copies, uniforms_1);

    // descriptor set layouts

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(3, sizeof(VkDescriptorSetLayout));

    // todo: descriptor_layout_system -> hash table to access and re-use this

    {
        VkDescriptorSetLayoutBinding bindings[1];
        memset(bindings, 0, sizeof(VkDescriptorSetLayoutBinding));

        bindings[0].binding = 0;
        bindings[0].descriptorCount = 1;
        bindings[0].descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        bindings[0].stageFlags = VK_SHADER_STAGE_VERTEX_BIT;

        VkDescriptorSetLayoutCreateInfo layout_info = {0};
        layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
        layout_info.bindingCount = 1;
        layout_info.pBindings = bindings;

        VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &descriptor_set_layouts[0]))
    }

    // todo: descriptor_layout_system -> hash table to access and re-use this

    {
        VkDescriptorSetLayoutBinding bindings[1];
        memset(bindings, 0, sizeof(VkDescriptorSetLayoutBinding));

        bindings[0].binding = 0;
        bindings[0].descriptorCount = 1;
        bindings[0].descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        bindings[0].stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

        VkDescriptorSetLayoutCreateInfo layout_info = {0};
        layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
        layout_info.bindingCount = 1;
        layout_info.pBindings = bindings;

        VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &descriptor_set_layouts[1]))
    }

    // descriptor pool

    VkDescriptorPool descriptor_pool = {0};

    {
        uint32_t max_sets = swapchain_copies;
        uint32_t pool_size_count = 1;

        VkDescriptorPoolSize pool_sizes[1];
        memset(pool_sizes, 0, 1 * sizeof(VkDescriptorPoolSize));

        pool_sizes[0].type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        pool_sizes[0].descriptorCount = swapchain_copies;

        VkDescriptorPoolCreateInfo pool_info = {0};
        pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
        pool_info.poolSizeCount = pool_size_count;
        pool_info.pPoolSizes = pool_sizes;
        pool_info.maxSets = max_sets;

        VK_RESULT_OK(vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &descriptor_pool));
    }

    // descriptor sets

    VkDescriptorSet *descriptor_sets_1;

    {
        uint32_t copies = swapchain_copies;

        descriptor_sets_1 = safe_calloc(swapchain_copies, sizeof(VkDescriptorSet));

        VkDescriptorSetLayout *layouts = safe_calloc(copies, sizeof(VkDescriptorSetLayout));

        for (uint32_t i = 0; i < copies; i++) {
            memcpy(&layouts[i], &descriptor_set_layouts[0], sizeof(VkDescriptorSetLayout));
        }

        VkDescriptorSetAllocateInfo info = {0};
        info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
        info.descriptorPool = descriptor_pool;
        info.descriptorSetCount = copies;
        info.pSetLayouts = layouts;

        VK_RESULT_OK(vkAllocateDescriptorSets(vk_state->vk_device, &info, descriptor_sets_1));

        free(layouts);

        for (uint32_t i = 0; i < copies; i++) {

            VkWriteDescriptorSet write_descriptors[1];
            memset(write_descriptors, 0, sizeof(VkWriteDescriptorSet));

            VkDescriptorBufferInfo buffer_info = {0};
            buffer_info.buffer = uniforms_1->vk_uniform_buffers[i];
            buffer_info.offset = 0;
            buffer_info.range = sizeof(struct uniform_projection);

            write_descriptors[0].sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write_descriptors[0].dstSet = descriptor_sets_1[i];
            write_descriptors[0].dstBinding = 0;
            write_descriptors[0].descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write_descriptors[0].descriptorCount = 1;
            write_descriptors[0].pBufferInfo = &buffer_info;

            vkUpdateDescriptorSets(vk_state->vk_device, 1, write_descriptors, 0, NULL);
        }
    }

    struct vulkan_pipe_data pipe_settings = {0};
    pipe_settings.vertex = "shaders/spv/screen.vert.spv";
    pipe_settings.fragment = "shaders/spv/screen.frag.spv";
    pipe_settings.number_of_sets = 2;

    struct vulkan_render_settings render_settings = {0};
    vulkan_render_settings_init(&render_settings, 2, 0, 0, 0, 0);

    struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);

    vulkan_pipeline_settings(pipeline, false, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);

    pipeline->descriptor_set_layout_count = 2;
    pipeline->descriptor_set_layouts = descriptor_set_layouts;

    vulkan_pipeline_basic_initialize(vk_state, vk_base, pipeline);

    screen->pipeline = pipeline;

    return screen;
}
