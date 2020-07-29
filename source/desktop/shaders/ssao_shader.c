#include "ssao_shader.h"

#define DESCRIPTOR_LAYOUT_COUNT 3
#define POOL_SIZE_COUNT 1

struct ssao_shader *new_ssao_shader(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    struct ssao_shader *shader = safe_calloc(1, sizeof(struct ssao_shader));

    uint32_t swapchain_copies = vk_base->swapchain->swapchain_image_count;

    // uniforms

    shader->uniforms1 = new_vulkan_uniform_buffer(sizeof(struct uniform_projection));
    vulkan_uniform_buffer_initialize(vk_state, swapchain_copies, shader->uniforms1);

    shader->uniforms3 = new_vulkan_uniform_buffer(sizeof(struct uniform_ssao));
    vulkan_uniform_buffer_initialize(vk_state, swapchain_copies, shader->uniforms3);

    // descriptor set layouts

    shader->descriptor_set_layouts = safe_calloc(DESCRIPTOR_LAYOUT_COUNT, sizeof(VkDescriptorSetLayout));

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

        VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &shader->descriptor_set_layouts[0]))
    }

    {
        VkDescriptorSetLayoutBinding bindings[3];
        memset(bindings, 0, 3 * sizeof(VkDescriptorSetLayoutBinding));

        bindings[0].binding = 0;
        bindings[0].descriptorCount = 1;
        bindings[0].descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        bindings[0].stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

        bindings[1].binding = 1;
        bindings[1].descriptorCount = 1;
        bindings[1].descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        bindings[1].stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

        bindings[2].binding = 2;
        bindings[2].descriptorCount = 1;
        bindings[2].descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        bindings[2].stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

        VkDescriptorSetLayoutCreateInfo layout_info = {0};
        layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
        layout_info.bindingCount = 3;
        layout_info.pBindings = bindings;

        VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &shader->descriptor_set_layouts[1]))
    }

    {
        VkDescriptorSetLayoutBinding bindings[1];
        memset(bindings, 0, sizeof(VkDescriptorSetLayoutBinding));

        bindings[0].binding = 0;
        bindings[0].descriptorCount = 1;
        bindings[0].descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        bindings[0].stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

        VkDescriptorSetLayoutCreateInfo layout_info = {0};
        layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
        layout_info.bindingCount = 1;
        layout_info.pBindings = bindings;

        VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &shader->descriptor_set_layouts[2]))
    }

    // descriptor pool

    {
        uint32_t max_sets = 2 * swapchain_copies;

        VkDescriptorPoolSize pool_size = {0};

        pool_size.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        pool_size.descriptorCount = max_sets;

        VkDescriptorPoolCreateInfo pool_info = {0};
        pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
        pool_info.poolSizeCount = POOL_SIZE_COUNT;
        pool_info.pPoolSizes = &pool_size;
        pool_info.maxSets = max_sets;

        VK_RESULT_OK(vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &shader->descriptor_pool));
    }

    // descriptor sets

    {
        uint32_t copies = swapchain_copies;

        shader->descriptor_sets1 = safe_calloc(swapchain_copies, sizeof(VkDescriptorSet));

        VkDescriptorSetLayout *layouts = safe_calloc(copies, sizeof(VkDescriptorSetLayout));

        for (uint32_t i = 0; i < copies; i++) {
            memcpy(&layouts[i], &shader->descriptor_set_layouts[0], sizeof(VkDescriptorSetLayout));
        }

        VkDescriptorSetAllocateInfo info = {0};
        info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
        info.descriptorPool = shader->descriptor_pool;
        info.descriptorSetCount = copies;
        info.pSetLayouts = layouts;

        VK_RESULT_OK(vkAllocateDescriptorSets(vk_state->vk_device, &info, shader->descriptor_sets1));

        free(layouts);

        struct vulkan_uniform_buffer *ub = shader->uniforms1;

        for (uint32_t i = 0; i < copies; i++) {

            VkWriteDescriptorSet write_descriptors[1];
            memset(write_descriptors, 0, sizeof(VkWriteDescriptorSet));

            VkDescriptorBufferInfo buffer_info = {0};
            buffer_info.buffer = ub->vk_uniform_buffers[i];
            buffer_info.offset = 0;
            buffer_info.range = ub->object_size;

            write_descriptors[0].sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write_descriptors[0].dstSet = shader->descriptor_sets1[i];
            write_descriptors[0].dstBinding = 0;
            write_descriptors[0].descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write_descriptors[0].descriptorCount = 1;
            write_descriptors[0].pBufferInfo = &buffer_info;

            vkUpdateDescriptorSets(vk_state->vk_device, 1, write_descriptors, 0, NULL);
        }
    }

    {
        uint32_t copies = swapchain_copies;

        shader->descriptor_sets3 = safe_calloc(swapchain_copies, sizeof(VkDescriptorSet));

        VkDescriptorSetLayout *layouts = safe_calloc(copies, sizeof(VkDescriptorSetLayout));

        for (uint32_t i = 0; i < copies; i++) {
            memcpy(&layouts[i], &shader->descriptor_set_layouts[2], sizeof(VkDescriptorSetLayout));
        }

        VkDescriptorSetAllocateInfo info = {0};
        info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
        info.descriptorPool = shader->descriptor_pool;
        info.descriptorSetCount = copies;
        info.pSetLayouts = layouts;

        VK_RESULT_OK(vkAllocateDescriptorSets(vk_state->vk_device, &info, shader->descriptor_sets3));

        free(layouts);

        struct vulkan_uniform_buffer *ub = shader->uniforms3;

        for (uint32_t i = 0; i < copies; i++) {

            VkWriteDescriptorSet write_descriptors[1];
            memset(write_descriptors, 0, sizeof(VkWriteDescriptorSet));

            VkDescriptorBufferInfo buffer_info = {0};
            buffer_info.buffer = ub->vk_uniform_buffers[i];
            buffer_info.offset = 0;
            buffer_info.range = ub->object_size;

            write_descriptors[0].sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write_descriptors[0].dstSet = shader->descriptor_sets3[i];
            write_descriptors[0].dstBinding = 0;
            write_descriptors[0].descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write_descriptors[0].descriptorCount = 1;
            write_descriptors[0].pBufferInfo = &buffer_info;

            vkUpdateDescriptorSets(vk_state->vk_device, 1, write_descriptors, 0, NULL);
        }
    }

    struct vulkan_pipe_data pipe_settings = {0};
    pipe_settings.vertex = "shaders/spv/screen.vert.spv";
    pipe_settings.fragment = "shaders/spv/ssao.frag.spv";
    pipe_settings.number_of_sets = DESCRIPTOR_LAYOUT_COUNT;

    pipe_settings.use_render_pass = true;
    pipe_settings.render_pass = offscreen->render_pass;
    pipe_settings.color_blend_attachments_count = 1;
    pipe_settings.color_blend_attachments = safe_calloc(pipe_settings.color_blend_attachments_count, sizeof(VkPipelineColorBlendAttachmentState));
    pipe_settings.color_blend_attachments[0] = create_color_blend_attachment(VK_COLOR_COMPONENT_R_BIT, VK_FALSE);

    struct vulkan_render_settings render_settings = {0};
    vulkan_render_settings_init(&render_settings, 2, 0, 0, 0, 0);

    struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);

    vulkan_pipeline_settings(pipeline, false, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);

    pipeline->descriptor_set_layout_count = DESCRIPTOR_LAYOUT_COUNT;
    pipeline->descriptor_set_layouts = shader->descriptor_set_layouts;

    vulkan_pipeline_basic_initialize(vk_state, vk_base, pipeline);

    shader->pipeline = pipeline;

    return shader;
}

void remake_ssao_shader(vulkan_state *vk_state, vulkan_base *vk_base, struct ssao_shader *shader) {
}

void delete_ssao_shader(vulkan_state *vk_state, struct ssao_shader *shader) {

    delete_vulkan_pipeline(vk_state, shader->pipeline);

    vulkan_uniform_buffer_clean(vk_state, shader->uniforms1);
    vulkan_uniform_buffer_clean(vk_state, shader->uniforms3);

    vkDestroyDescriptorPool(vk_state->vk_device, shader->descriptor_pool, NULL);

    for (int i = 0; i < DESCRIPTOR_LAYOUT_COUNT; i++) {
        vkDestroyDescriptorSetLayout(vk_state->vk_device, shader->descriptor_set_layouts[i], NULL);
    }

    free(shader);
}

float *ssao_samples() {
    const int sample_size = 64 * 3;
    float *samples = safe_malloc(sample_size * sizeof(float));
    for (int i = 0; i < sample_size; i += 3) {
        samples[i] = 2.0f * rand_float() - 1.0f;
        samples[i + 1] = 2.0f * rand_float() - 1.0f;
        samples[i + 2] = (float)rand() / (float)RAND_MAX;
        vector3f_normalize(&samples[i]);
        float multiple = (float)rand() / (float)RAND_MAX;
        samples[i] *= multiple;
        samples[i + 1] *= multiple;
        samples[i + 2] *= multiple;
        float scale = (float)i / 64.0f;
        scale = lerp(0.1f, 1.0f, scale * scale);
        samples[i] *= scale;
        samples[i + 1] *= scale;
        samples[i + 2] *= scale;
    }
    return samples;
}

image_pixels *ssao_noise() {
    const int noise_size = 16 * 3;
    float *pixels = safe_malloc(noise_size * sizeof(float));
    for (int i = 0; i < noise_size; i += 3) {
        pixels[i] = 2.0f * rand_float() - 1.0f;
        pixels[i + 1] = 2.0f * rand_float() - 1.0f;
        pixels[i + 2] = 0.0f;
    }
    image_pixels *noise = safe_calloc(1, sizeof(image_pixels));
    noise->width = 4;
    noise->height = 4;
    noise->pixels = pixels;
    return noise;
}
