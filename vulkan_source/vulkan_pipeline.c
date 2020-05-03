#include "vulkan_pipeline.h"

void vk_create_render_pass(vulkan_state *vk_state) {

    VkAttachmentDescription color_attachment = {0};
    color_attachment.format = vk_state->swapchain_image_format;
    color_attachment.samples = VK_SAMPLE_COUNT_1_BIT;
    color_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
    color_attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    color_attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    color_attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    color_attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    color_attachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

    VkAttachmentReference color_attachment_ref = {0};
    color_attachment_ref.attachment = 0;
    color_attachment_ref.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

    VkSubpassDescription subpass = {0};
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.colorAttachmentCount = 1;
    subpass.pColorAttachments = &color_attachment_ref;

    VkSubpassDependency dependency = {0};
    dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
    dependency.dstSubpass = 0;
    dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.srcAccessMask = 0;
    dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

    VkRenderPassCreateInfo render_pass_info = {0};
    render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
    render_pass_info.attachmentCount = 1;
    render_pass_info.pAttachments = &color_attachment;
    render_pass_info.subpassCount = 1;
    render_pass_info.pSubpasses = &subpass;
    render_pass_info.dependencyCount = 1;
    render_pass_info.pDependencies = &dependency;

    VkRenderPass render_pass;

    if (vkCreateRenderPass(vk_state->vk_device, &render_pass_info, NULL, &render_pass) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Render Pass\n");
        exit(1);
    }

    vk_state->vk_render_pass = render_pass;
}

VkShaderModule vk_create_shader_module(vulkan_state *vk_state, char *code, size_t size) {

    VkShaderModuleCreateInfo vk_shader_info = {0};
    vk_shader_info.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
    vk_shader_info.codeSize = size;
    vk_shader_info.pCode = (const uint32_t *)code;

    VkShaderModule vk_shader_module;

    if (vkCreateShaderModule(vk_state->vk_device, &vk_shader_info, NULL, &vk_shader_module) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Shader Module\n");
        exit(1);
    }

    return vk_shader_module;
}

void vk_create_graphics_pipeline(vulkan_state *vk_state) {

    size_t vertex_shader_size;
    char *vertex_shader = read_binary("tri_vert.spv", &vertex_shader_size);

    size_t fragment_shader_size;
    char *fragment_shader = read_binary("tri_frag.spv", &fragment_shader_size);

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

    int position = vk_state->position;
    int color = vk_state->color;
    int texture = vk_state->texture;
    int normal = vk_state->normal;

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
    viewport.width = (float)vk_state->swapchain_extent.width;
    viewport.height = (float)vk_state->swapchain_extent.height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;

    VkRect2D scissor = {0};
    scissor.offset = (VkOffset2D){0, 0};
    scissor.extent = vk_state->swapchain_extent;

    VkPipelineViewportStateCreateInfo viewport_state = {0};
    viewport_state.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
    viewport_state.viewportCount = 1;
    viewport_state.pViewports = &viewport;
    viewport_state.scissorCount = 1;
    viewport_state.pScissors = &scissor;

    VkPipelineRasterizationStateCreateInfo rasterizer = {0};
    rasterizer.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
    rasterizer.depthClampEnable = VK_FALSE;
    rasterizer.rasterizerDiscardEnable = VK_FALSE;
    rasterizer.polygonMode = VK_POLYGON_MODE_FILL;
    rasterizer.lineWidth = 1.0f;
    rasterizer.cullMode = VK_CULL_MODE_BACK_BIT;
    rasterizer.frontFace = VK_FRONT_FACE_CLOCKWISE;
    rasterizer.depthBiasEnable = VK_FALSE;

    VkPipelineMultisampleStateCreateInfo multisampling = {0};
    multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
    multisampling.sampleShadingEnable = VK_FALSE;
    multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;

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

    VkPipelineLayout pipeline_layout;

    if (vkCreatePipelineLayout(vk_state->vk_device, &pipeline_layout_info, NULL, &pipeline_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Pipeline Layout\n");
        exit(1);
    }

    vk_state->vk_pipeline_layout = pipeline_layout;

    VkGraphicsPipelineCreateInfo pipeline_info = {0};
    pipeline_info.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
    pipeline_info.stageCount = 2;
    pipeline_info.pStages = shader_stages;
    pipeline_info.pVertexInputState = &vertex_input_info;
    pipeline_info.pInputAssemblyState = &input_assembly;
    pipeline_info.pViewportState = &viewport_state;
    pipeline_info.pRasterizationState = &rasterizer;
    pipeline_info.pMultisampleState = &multisampling;
    pipeline_info.pColorBlendState = &color_blending;
    pipeline_info.layout = pipeline_layout;
    pipeline_info.renderPass = vk_state->vk_render_pass;
    pipeline_info.subpass = 0;
    pipeline_info.basePipelineHandle = VK_NULL_HANDLE;

    VkPipeline pipeline;

    if (vkCreateGraphicsPipelines(vk_state->vk_device, VK_NULL_HANDLE, 1, &pipeline_info, NULL, &pipeline) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Pipeline\n");
        exit(1);
    }

    vk_state->vk_pipeline = pipeline;

    vkDestroyShaderModule(vk_state->vk_device, vertex_module, NULL);
    vkDestroyShaderModule(vk_state->vk_device, fragment_module, NULL);
}
