#include "vulkan_pipeline.h"

struct vulkan_pipeline *create_vulkan_pipeline(struct vulkan_pipe_data pipe_data, struct vulkan_render_settings render_settings) {
    struct vulkan_pipeline *self = safe_calloc(1, sizeof(struct vulkan_pipeline));
    self->pipe_data = pipe_data;
    self->render_settings = render_settings;
    return self;
}

void vulkan_pipeline_settings(struct vulkan_pipeline *self, bool include_depth, VkFrontFace rasterize_face, VkCullModeFlagBits rasterize_cull_mode) {
    self->include_depth = include_depth;
    self->rasterize_face = rasterize_face;
    self->rasterize_cull_mode = rasterize_cull_mode;
}

VkShaderModule vk_create_shader_module(vulkan_state *vk_state, char *code, size_t size) {

    VkShaderModuleCreateInfo vk_shader_info = {0};
    vk_shader_info.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
    vk_shader_info.codeSize = size;
    vk_shader_info.pCode = (const uint32_t *)code;

    VkShaderModule vk_shader_module = {0};

    if (vkCreateShaderModule(vk_state->vk_device, &vk_shader_info, NULL, &vk_shader_module) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Shader Module\n");
        exit(1);
    }

    return vk_shader_module;
}

void vulkan_pipeline_compile_graphics(vulkan_state *vk_state, vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    struct vulkan_render_settings *render_settings = &pipeline->render_settings;

    size_t vertex_shader_size;
    char *vertex_shader = read_binary(pipeline->pipe_data.vertex, &vertex_shader_size);

    size_t fragment_shader_size;
    char *fragment_shader = read_binary(pipeline->pipe_data.fragment, &fragment_shader_size);

    VkShaderModule vertex_module = vk_create_shader_module(vk_state, vertex_shader, vertex_shader_size);
    VkShaderModule fragment_module = vk_create_shader_module(vk_state, fragment_shader, fragment_shader_size);

    VkPipelineShaderStageCreateInfo vertex_pipeline_stage_info = {0};
    vertex_pipeline_stage_info.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
    vertex_pipeline_stage_info.stage = VK_SHADER_STAGE_VERTEX_BIT;
    vertex_pipeline_stage_info.module = vertex_module;
    vertex_pipeline_stage_info.pName = "main";

    VkPipelineShaderStageCreateInfo fragment_pipeline_stage_info = {0};
    fragment_pipeline_stage_info.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
    fragment_pipeline_stage_info.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
    fragment_pipeline_stage_info.module = fragment_module;
    fragment_pipeline_stage_info.pName = "main";

    VkPipelineShaderStageCreateInfo shader_stages[2] = {vertex_pipeline_stage_info, fragment_pipeline_stage_info};

    VkPipelineVertexInputStateCreateInfo vertex_input_info = {0};
    vertex_input_info.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;

    int attribute_count = vk_attribute_count(render_settings);

    VkVertexInputBindingDescription binding_description = vk_binding_description(render_settings);
    VkVertexInputAttributeDescription *attribute_description = vk_attribute_description(render_settings);

    vertex_input_info.pVertexBindingDescriptions = &binding_description;
    vertex_input_info.vertexBindingDescriptionCount = 1;
    vertex_input_info.pVertexAttributeDescriptions = attribute_description;
    vertex_input_info.vertexAttributeDescriptionCount = attribute_count;

    VkPipelineInputAssemblyStateCreateInfo input_assembly = {0};
    input_assembly.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
    input_assembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
    input_assembly.primitiveRestartEnable = VK_FALSE;

    VkExtent2D vk_extent = vk_base->swapchain->swapchain_extent;

    VkViewport viewport = {0};
    viewport.x = 0.0f;
    viewport.y = 0.0f;
    viewport.width = (float)vk_extent.width;
    viewport.height = (float)vk_extent.height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;

    VkRect2D scissor = {0};
    scissor.offset = (VkOffset2D){0, 0};
    scissor.extent = vk_extent;

    VkPipelineViewportStateCreateInfo viewport_state = {0};
    viewport_state.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
    viewport_state.viewportCount = 1;
    viewport_state.pViewports = &viewport;
    viewport_state.scissorCount = 1;
    viewport_state.pScissors = &scissor;

    VkPipelineRasterizationStateCreateInfo rasterizer_info = {0};
    rasterizer_info.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
    rasterizer_info.depthClampEnable = VK_FALSE;
    rasterizer_info.rasterizerDiscardEnable = VK_FALSE;
    rasterizer_info.polygonMode = VK_POLYGON_MODE_FILL;
    rasterizer_info.lineWidth = 1.0f;
    rasterizer_info.depthBiasEnable = VK_FALSE;
    rasterizer_info.cullMode = pipeline->rasterize_cull_mode;
    rasterizer_info.frontFace = pipeline->rasterize_face;

    VkPipelineMultisampleStateCreateInfo multisampling = {0};
    multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
    multisampling.sampleShadingEnable = VK_FALSE;
    multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;

    VkPipelineDepthStencilStateCreateInfo depth_stencil = {0};
    depth_stencil.sType = VK_STRUCTURE_TYPE_PIPELINE_DEPTH_STENCIL_STATE_CREATE_INFO;
    depth_stencil.depthBoundsTestEnable = VK_FALSE;
    depth_stencil.minDepthBounds = 0.0f;
    depth_stencil.maxDepthBounds = 1.0f;
    depth_stencil.stencilTestEnable = VK_FALSE;

    if (pipeline->include_depth) {
        depth_stencil.depthTestEnable = VK_TRUE;
        depth_stencil.depthWriteEnable = VK_TRUE;
        depth_stencil.depthCompareOp = VK_COMPARE_OP_LESS_OR_EQUAL;
    } else {
        depth_stencil.depthTestEnable = VK_FALSE;
        depth_stencil.depthWriteEnable = VK_FALSE;
        depth_stencil.depthCompareOp = VK_COMPARE_OP_ALWAYS;
    }

    struct vulkan_pipe_data *pipe_data = &pipeline->pipe_data;

    uint32_t color_blend_attachment_count = pipe_data->color_blend_attachments == NULL ? 1 : pipe_data->color_blend_attachments_count;

    VkPipelineColorBlendAttachmentState *color_blend_attachments = safe_calloc(color_blend_attachment_count, sizeof(VkPipelineColorBlendAttachmentState));

    if (pipe_data->color_blend_attachments == NULL) {
        color_blend_attachments[0].colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
        color_blend_attachments[0].blendEnable = VK_FALSE;
    } else {
        memcpy(color_blend_attachments, pipe_data->color_blend_attachments, color_blend_attachment_count * sizeof(VkPipelineColorBlendAttachmentState));
    }

    VkPipelineColorBlendStateCreateInfo color_blending = {0};
    color_blending.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
    color_blending.logicOpEnable = VK_FALSE;
    color_blending.attachmentCount = color_blend_attachment_count;
    color_blending.pAttachments = color_blend_attachments;

    VkPipelineLayoutCreateInfo pipeline_layout_info = {0};
    pipeline_layout_info.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;

    VkDescriptorSetLayout *descriptor_layouts = NULL;

    if (pipeline->descriptor_set_layout_count > 0) {

        pipeline_layout_info.setLayoutCount = pipeline->descriptor_set_layout_count;
        pipeline_layout_info.pSetLayouts = pipeline->descriptor_set_layouts;

    } else {

        uint32_t descriptor_layout_count = pipeline->pipe_data.number_of_sets;
        VkDescriptorSetLayout *descriptor_layouts = safe_calloc(descriptor_layout_count, sizeof(VkDescriptorSetLayout));
        for (uint32_t i = 0; i < descriptor_layout_count; i++) {
            descriptor_layouts[i] = pipeline->pipe_data.sets[i].descriptor_layout;
        }

        pipeline_layout_info.setLayoutCount = descriptor_layout_count;
        pipeline_layout_info.pSetLayouts = descriptor_layouts;
    }

    VkPipelineLayout vk_pipeline_layout = {0};

    if (vkCreatePipelineLayout(vk_state->vk_device, &pipeline_layout_info, NULL, &vk_pipeline_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Pipeline Layout\n");
        exit(1);
    }

    pipeline->vk_pipeline_layout = vk_pipeline_layout;

    VkRenderPass vk_render_pass = pipe_data->use_render_pass ? pipe_data->render_pass : vk_base->vk_render_pass;

    VkGraphicsPipelineCreateInfo pipeline_info = {0};
    pipeline_info.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
    pipeline_info.stageCount = 2;
    pipeline_info.pStages = shader_stages;
    pipeline_info.pVertexInputState = &vertex_input_info;
    pipeline_info.pInputAssemblyState = &input_assembly;
    pipeline_info.pViewportState = &viewport_state;
    pipeline_info.pRasterizationState = &rasterizer_info;
    pipeline_info.pMultisampleState = &multisampling;
    pipeline_info.pDepthStencilState = &depth_stencil;
    pipeline_info.pColorBlendState = &color_blending;
    pipeline_info.layout = vk_pipeline_layout;
    pipeline_info.renderPass = vk_render_pass;
    pipeline_info.subpass = 0;
    pipeline_info.basePipelineHandle = VK_NULL_HANDLE;

    if (vkCreateGraphicsPipelines(vk_state->vk_device, VK_NULL_HANDLE, 1, &pipeline_info, NULL, &pipeline->vk_pipeline) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Pipeline\n");
        exit(1);
    }

    vkDestroyShaderModule(vk_state->vk_device, vertex_module, NULL);
    vkDestroyShaderModule(vk_state->vk_device, fragment_module, NULL);

    free(vertex_shader);
    free(fragment_shader);
    free(attribute_description);
    free(descriptor_layouts);
    free(color_blend_attachments);
}
