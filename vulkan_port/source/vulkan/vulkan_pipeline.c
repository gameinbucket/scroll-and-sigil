#include "vulkan_pipeline.h"

struct vulkan_pipeline *vk_create_pipeline(char *vertex, char *fragment) {
    struct vulkan_pipeline *self = safe_calloc(1, sizeof(struct vulkan_pipeline));
    self->vertex_shader_path = vertex;
    self->fragment_shader_path = fragment;
    return self;
}

void vk_create_render_pass(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    VkAttachmentDescription color_attachment = {0};
    color_attachment.format = vk_renderer->swapchain->swapchain_image_format;
    color_attachment.samples = VK_SAMPLE_COUNT_1_BIT;
    color_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
    color_attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    color_attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    color_attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    color_attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    color_attachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

    VkAttachmentDescription depth_attachment = {0};
    depth_attachment.format = vk_renderer->vk_depth_format;
    depth_attachment.samples = VK_SAMPLE_COUNT_1_BIT;
    depth_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
    depth_attachment.storeOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    depth_attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    depth_attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    depth_attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    depth_attachment.finalLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

    VkAttachmentReference color_attachment_ref = {0};
    color_attachment_ref.attachment = 0;
    color_attachment_ref.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

    VkAttachmentReference depth_attachment_ref = {0};
    depth_attachment_ref.attachment = 1;
    depth_attachment_ref.layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

    VkSubpassDescription subpass = {0};
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.colorAttachmentCount = 1;
    subpass.pColorAttachments = &color_attachment_ref;
    subpass.pDepthStencilAttachment = &depth_attachment_ref;

    VkSubpassDependency dependency = {0};
    dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
    dependency.dstSubpass = 0;
    dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.srcAccessMask = 0;
    dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

    VkAttachmentDescription attachments[2] = {color_attachment, depth_attachment};

    VkRenderPassCreateInfo render_pass_info = {0};
    render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
    render_pass_info.attachmentCount = 2;
    render_pass_info.pAttachments = attachments;
    render_pass_info.subpassCount = 1;
    render_pass_info.pSubpasses = &subpass;
    render_pass_info.dependencyCount = 1;
    render_pass_info.pDependencies = &dependency;

    VkRenderPass render_pass = {0};

    if (vkCreateRenderPass(vk_state->vk_device, &render_pass_info, NULL, &render_pass) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Render Pass\n");
        exit(1);
    }

    vk_renderer->vk_render_pass = render_pass;
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

void vk_create_graphics_pipeline(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, struct vulkan_pipeline *vk_pipeline) {

    size_t vertex_shader_size;
    char *vertex_shader = read_binary(vk_pipeline->vertex_shader_path, &vertex_shader_size);

    size_t fragment_shader_size;
    char *fragment_shader = read_binary(vk_pipeline->fragment_shader_path, &fragment_shader_size);

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

    int position = vk_pipeline->rendering->position;
    int color = vk_pipeline->rendering->color;
    int texture = vk_pipeline->rendering->texture;
    int normal = vk_pipeline->rendering->normal;

    int attribute_count = vk_attribute_count(position, color, texture, normal);

    VkVertexInputBindingDescription binding_description = vk_binding_description(position, color, texture, normal);
    VkVertexInputAttributeDescription *attribute_description = vk_attribute_description(position, color, texture, normal);

    vertex_input_info.pVertexBindingDescriptions = &binding_description;
    vertex_input_info.vertexBindingDescriptionCount = 1;
    vertex_input_info.pVertexAttributeDescriptions = attribute_description;
    vertex_input_info.vertexAttributeDescriptionCount = attribute_count;

    VkPipelineInputAssemblyStateCreateInfo input_assembly = {0};
    input_assembly.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
    input_assembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
    input_assembly.primitiveRestartEnable = VK_FALSE;

    VkViewport viewport = {0};
    viewport.x = 0.0f;
    viewport.y = 0.0f;
    viewport.width = (float)vk_renderer->swapchain->swapchain_extent.width;
    viewport.height = (float)vk_renderer->swapchain->swapchain_extent.height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;

    VkRect2D scissor = {0};
    scissor.offset = (VkOffset2D){0, 0};
    scissor.extent = vk_renderer->swapchain->swapchain_extent;

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
    rasterizer_info.cullMode = VK_CULL_MODE_BACK_BIT;
    rasterizer_info.frontFace = VK_FRONT_FACE_CLOCKWISE;
    rasterizer_info.depthBiasEnable = VK_FALSE;

    VkPipelineMultisampleStateCreateInfo multisampling = {0};
    multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
    multisampling.sampleShadingEnable = VK_FALSE;
    multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;

    VkPipelineDepthStencilStateCreateInfo depth_stencil = {0};
    depth_stencil.sType = VK_STRUCTURE_TYPE_PIPELINE_DEPTH_STENCIL_STATE_CREATE_INFO;
    depth_stencil.depthTestEnable = VK_TRUE;
    depth_stencil.depthWriteEnable = VK_TRUE;
    depth_stencil.depthCompareOp = VK_COMPARE_OP_LESS;
    depth_stencil.depthBoundsTestEnable = VK_FALSE;
    depth_stencil.minDepthBounds = 0.0f;
    depth_stencil.maxDepthBounds = 1.0f;
    depth_stencil.stencilTestEnable = VK_FALSE;

    VkPipelineColorBlendAttachmentState color_blend_attachment = {0};
    color_blend_attachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
    color_blend_attachment.blendEnable = VK_FALSE;

    VkPipelineColorBlendStateCreateInfo color_blending = {0};
    color_blending.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
    color_blending.logicOpEnable = VK_FALSE;
    color_blending.attachmentCount = 1;
    color_blending.pAttachments = &color_blend_attachment;

    VkPipelineLayoutCreateInfo pipeline_layout_info = {0};
    pipeline_layout_info.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
    pipeline_layout_info.setLayoutCount = 1;
    pipeline_layout_info.pSetLayouts = &vk_renderer->vk_descriptor_set_layout;

    VkPipelineLayout vk_pipeline_layout = {0};

    if (vkCreatePipelineLayout(vk_state->vk_device, &pipeline_layout_info, NULL, &vk_pipeline_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Pipeline Layout\n");
        exit(1);
    }

    vk_renderer->vk_pipeline_layout = vk_pipeline_layout;

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
    pipeline_info.renderPass = vk_renderer->vk_render_pass;
    pipeline_info.subpass = 0;
    pipeline_info.basePipelineHandle = VK_NULL_HANDLE;

    if (vkCreateGraphicsPipelines(vk_state->vk_device, VK_NULL_HANDLE, 1, &pipeline_info, NULL, &vk_renderer->vk_pipeline) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Pipeline\n");
        exit(1);
    }

    vkDestroyShaderModule(vk_state->vk_device, vertex_module, NULL);
    vkDestroyShaderModule(vk_state->vk_device, fragment_module, NULL);

    free(vertex_shader);
    free(fragment_shader);
    free(attribute_description);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *self) {
    delete_vulkan_renderbuffer(vk_state, self->rendering);
    free(self);
}
