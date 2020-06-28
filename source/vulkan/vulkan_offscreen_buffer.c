#include "vulkan_offscreen_buffer.h"

static void init_vulkan_frame_attachment(vulkan_state *vk_state, vulkan_frame_attachment *attachment, VkFormat format, VkImageUsageFlagBits usage, uint32_t width, uint32_t height) {

    attachment->format = format;

    VkImageAspectFlags flags = 0;

    if (usage & VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT) {
        flags = VK_IMAGE_ASPECT_COLOR_BIT;
    } else {
        flags = VK_IMAGE_ASPECT_DEPTH_BIT;
    }

    VkImageCreateInfo image_info = {0};
    image_info.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
    image_info.imageType = VK_IMAGE_TYPE_2D;
    image_info.format = format;
    image_info.extent.width = width;
    image_info.extent.height = height;
    image_info.extent.depth = 1;
    image_info.mipLevels = 1;
    image_info.arrayLayers = 1;
    image_info.samples = VK_SAMPLE_COUNT_1_BIT;
    image_info.tiling = VK_IMAGE_TILING_OPTIMAL;
    image_info.usage = usage | VK_IMAGE_USAGE_SAMPLED_BIT;

    VkMemoryAllocateInfo mem_alloc = {0};
    mem_alloc.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;

    VkMemoryRequirements mem_requirements;

    VK_RESULT_OK(vkCreateImage(vk_state->vk_device, &image_info, NULL, &attachment->image));

    vkGetImageMemoryRequirements(vk_state->vk_device, attachment->image, &mem_requirements);

    mem_alloc.allocationSize = mem_requirements.size;
    mem_alloc.memoryTypeIndex = vk_memory_type(vk_state, mem_requirements.memoryTypeBits, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT);

    VK_RESULT_OK(vkAllocateMemory(vk_state->vk_device, &mem_alloc, NULL, &attachment->memory) != VK_SUCCESS);

    VK_RESULT_OK(vkBindImageMemory(vk_state->vk_device, attachment->image, attachment->memory, 0));

    VkImageSubresourceRange sub_resource = {0};
    sub_resource.aspectMask = flags;
    sub_resource.baseMipLevel = 0;
    sub_resource.levelCount = 1;
    sub_resource.baseArrayLayer = 0;
    sub_resource.layerCount = 1;

    VkImageViewCreateInfo view_info = {0};
    view_info.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
    view_info.viewType = VK_IMAGE_VIEW_TYPE_2D;
    view_info.format = format;
    view_info.subresourceRange = sub_resource;
    view_info.image = attachment->image;

    VK_RESULT_OK(vkCreateImageView(vk_state->vk_device, &view_info, NULL, &attachment->view));
}

static void prepare_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_offscreen_buffer *offscreen, uint32_t width, uint32_t height) {

    offscreen->width = width;
    offscreen->height = height;

    init_vulkan_frame_attachment(vk_state, &offscreen->color, VK_FORMAT_R8G8B8A8_UNORM, VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT, width, height);
    init_vulkan_frame_attachment(vk_state, &offscreen->normal, VK_FORMAT_R16G16B16A16_SFLOAT, VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT, width, height);
    init_vulkan_frame_attachment(vk_state, &offscreen->position, VK_FORMAT_R16G16B16A16_SFLOAT, VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT, width, height);

    VkFormat depth_format = vk_find_depth_format(vk_state);

    init_vulkan_frame_attachment(vk_state, &offscreen->depth, depth_format, VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT, width, height);

    VkAttachmentDescription descriptions[4] = {0};

    for (uint32_t i = 0; i < 4; ++i) {
        descriptions[i].samples = VK_SAMPLE_COUNT_1_BIT;
        descriptions[i].loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
        descriptions[i].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
        descriptions[i].stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
        descriptions[i].stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
        descriptions[i].initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;

        if (i == 3) {
            descriptions[i].finalLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
        } else {
            descriptions[i].finalLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
        }
    }

    descriptions[0].format = offscreen->color.format;
    descriptions[1].format = offscreen->normal.format;
    descriptions[2].format = offscreen->position.format;
    descriptions[3].format = offscreen->depth.format;

    VkAttachmentReference color_reference[3];
    color_reference[0] = (VkAttachmentReference){.attachment = 0, .layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL};
    color_reference[1] = (VkAttachmentReference){.attachment = 1, .layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL};
    color_reference[2] = (VkAttachmentReference){.attachment = 2, .layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL};

    VkAttachmentReference depth_reference = (VkAttachmentReference){.attachment = 3, .layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL};

    VkSubpassDescription subpass = {0};
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.pColorAttachments = color_reference;
    subpass.colorAttachmentCount = 3;
    subpass.pDepthStencilAttachment = &depth_reference;

    VkSubpassDependency dependencies[2] = {0};

    dependencies[0].srcSubpass = VK_SUBPASS_EXTERNAL;
    dependencies[0].dstSubpass = 0;
    dependencies[0].srcStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;
    dependencies[0].dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependencies[0].srcAccessMask = VK_ACCESS_MEMORY_READ_BIT;
    dependencies[0].dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
    dependencies[0].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;

    dependencies[1].srcSubpass = 0;
    dependencies[1].dstSubpass = VK_SUBPASS_EXTERNAL;
    dependencies[1].srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependencies[1].dstStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;
    dependencies[1].srcAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
    dependencies[1].dstAccessMask = VK_ACCESS_MEMORY_READ_BIT;
    dependencies[1].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;

    VkRenderPassCreateInfo render_pass_info = {0};
    render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
    render_pass_info.attachmentCount = 4;
    render_pass_info.pAttachments = descriptions;
    render_pass_info.subpassCount = 1;
    render_pass_info.pSubpasses = &subpass;
    render_pass_info.dependencyCount = 2;
    render_pass_info.pDependencies = dependencies;

    VK_RESULT_OK(vkCreateRenderPass(vk_state->vk_device, &render_pass_info, NULL, &offscreen->render_pass));

    VkImageView attachments[4];
    attachments[0] = offscreen->color.view;
    attachments[1] = offscreen->normal.view;
    attachments[2] = offscreen->position.view;
    attachments[3] = offscreen->depth.view;

    VkFramebufferCreateInfo create_info = {0};
    create_info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
    create_info.pNext = NULL;
    create_info.renderPass = offscreen->render_pass;
    create_info.pAttachments = attachments;
    create_info.attachmentCount = 4;
    create_info.width = offscreen->width;
    create_info.height = offscreen->height;
    create_info.layers = 1;

    VK_RESULT_OK(vkCreateFramebuffer(vk_state->vk_device, &create_info, NULL, &offscreen->buffer));

    VkSamplerCreateInfo sampler_info = {0};
    sampler_info.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
    sampler_info.magFilter = VK_FILTER_NEAREST;
    sampler_info.minFilter = VK_FILTER_NEAREST;
    sampler_info.mipmapMode = VK_SAMPLER_MIPMAP_MODE_LINEAR;
    sampler_info.addressModeU = VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_EDGE;
    sampler_info.addressModeV = sampler_info.addressModeU;
    sampler_info.addressModeW = sampler_info.addressModeU;
    sampler_info.mipLodBias = 0.0f;
    sampler_info.maxAnisotropy = 1.0f;
    sampler_info.minLod = 0.0f;
    sampler_info.maxLod = 1.0f;
    sampler_info.borderColor = VK_BORDER_COLOR_FLOAT_OPAQUE_WHITE;

    VK_RESULT_OK(vkCreateSampler(vk_state->vk_device, &sampler_info, NULL, &offscreen->color_sampler));

    VkSemaphoreCreateInfo semaphore_info = {0};
    semaphore_info.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

    VK_RESULT_OK(vkCreateSemaphore(vk_state->vk_device, &semaphore_info, NULL, &offscreen->semaphore));
}

vulkan_offscreen_buffer *create_vulkan_offscreen_buffer(vulkan_state *vk_state, uint32_t width, uint32_t height) {

    vulkan_offscreen_buffer *offscreen = safe_calloc(1, sizeof(vulkan_offscreen_buffer));
    prepare_vulkan_offscreen_buffer(vk_state, offscreen, width, height);
    return offscreen;
}

static void delete_vulkan_frame_attachment(vulkan_state *vk_state, vulkan_frame_attachment *self) {

    vkDestroyImageView(vk_state->vk_device, self->view, NULL);
    vkDestroyImage(vk_state->vk_device, self->image, NULL);
    vkFreeMemory(vk_state->vk_device, self->memory, NULL);
}

void delete_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_offscreen_buffer *self) {

    delete_vulkan_frame_attachment(vk_state, &self->color);
    delete_vulkan_frame_attachment(vk_state, &self->normal);
    delete_vulkan_frame_attachment(vk_state, &self->position);
    delete_vulkan_frame_attachment(vk_state, &self->depth);

    vkDestroySampler(vk_state->vk_device, self->color_sampler, NULL);
    vkDestroyFramebuffer(vk_state->vk_device, self->buffer, NULL);
    vkDestroyRenderPass(vk_state->vk_device, self->render_pass, NULL);
    vkDestroySemaphore(vk_state->vk_device, self->semaphore, NULL);
}

void vulkan_offscreen_buffer_begin_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    uint32_t width = offscreen->width;
    uint32_t height = offscreen->height;

    VkClearValue clear_color = {.color = (VkClearColorValue){{0.0f, 0.0f, 0.0f, 0.0f}}};
    VkClearValue clear_depth = {.depthStencil = (VkClearDepthStencilValue){1.0f, 0}};

    VkClearValue clear_values[4] = {clear_color, clear_color, clear_color, clear_depth};

    VkRenderPassBeginInfo render_pass_info = {0};
    render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
    render_pass_info.renderPass = offscreen->render_pass;
    render_pass_info.renderArea.offset = (VkOffset2D){0, 0};
    render_pass_info.renderArea.extent = (VkExtent2D){width, height};
    render_pass_info.clearValueCount = 4;
    render_pass_info.pClearValues = clear_values;
    render_pass_info.framebuffer = offscreen->buffer;

    VkViewport viewport = {0};
    viewport.width = width;
    viewport.height = height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;

    VkRect2D scissor = {0};
    scissor.extent = (VkExtent2D){width, height};
    scissor.offset = (VkOffset2D){0, 0};

    VkCommandBuffer command_buffer = offscreen->command_buffer;

    VkCommandBufferBeginInfo command_begin_info = {0};
    command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;

    VK_RESULT_OK(vkBeginCommandBuffer(command_buffer, &command_begin_info));

    vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

    vkCmdSetViewport(command_buffer, 0, 1, &viewport);
    vkCmdSetScissor(command_buffer, 0, 1, &scissor);
}

void vulkan_offscreen_buffer_end_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    vkCmdEndRenderPass(offscreen->command_buffer);
    VK_RESULT_OK(vkEndCommandBuffer(offscreen->command_buffer));
}
