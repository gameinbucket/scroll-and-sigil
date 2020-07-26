#include "vulkan_offscreen_buffer.h"

struct vulkan_image_view_and_sample get_vulkan_offscreen_buffer_view_and_sample(vulkan_offscreen_buffer *offscreen, int index) {
    return (struct vulkan_image_view_and_sample){
        .view = offscreen->attachments[index].view,
        .sample = offscreen->color_sampler,
    };
}

static void init_vulkan_frame_attachment(vulkan_state *vk_state, struct vulkan_frame_attachment *attachment, VkFormat format, VkImageUsageFlagBits usage, uint32_t width, uint32_t height) {

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

static void prepare_descriptors(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    // descriptor set layout

    VkDescriptorSetLayoutBinding sampler_layout_binding = {0};
    sampler_layout_binding.binding = 0;
    sampler_layout_binding.descriptorCount = 1;
    sampler_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    sampler_layout_binding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

    VkDescriptorSetLayoutCreateInfo layout_info = {0};
    layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    layout_info.bindingCount = 1;
    layout_info.pBindings = &sampler_layout_binding;

    VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &offscreen->descriptor_set_layout));

    // descriptor pool

    VkDescriptorPoolSize pool_size = {0};
    pool_size.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    pool_size.descriptorCount = 1;

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = 1;
    pool_info.pPoolSizes = &pool_size;
    pool_info.maxSets = 1;

    VK_RESULT_OK(vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &offscreen->descriptor_pool));

    // descriptor set

    VkDescriptorSetAllocateInfo info = {0};
    info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    info.descriptorPool = offscreen->descriptor_pool;
    info.descriptorSetCount = 1;
    info.pSetLayouts = &offscreen->descriptor_set_layout;

    VK_RESULT_OK(vkAllocateDescriptorSets(vk_state->vk_device, &info, &offscreen->descriptor_set));

    uint32_t attachment_count = offscreen->attachment_count;

    VkDescriptorImageInfo *descriptor_image_info = safe_calloc(attachment_count, sizeof(VkDescriptorImageInfo));
    VkWriteDescriptorSet *write_descriptors = safe_calloc(attachment_count, sizeof(VkWriteDescriptorSet));

    for (uint32_t i = 0; i < attachment_count; i++) {

        descriptor_image_info[i] = new_descriptor_image_info(offscreen->color_sampler, offscreen->attachments[i].view, VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);
        write_descriptors[i] = new_image_descriptor_writer(offscreen->descriptor_set, VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, i, &descriptor_image_info[i], 1);
    }

    vkUpdateDescriptorSets(vk_state->vk_device, 1, write_descriptors, 0, NULL);

    free(descriptor_image_info);
    free(write_descriptors);
}

static void prepare_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    uint32_t width = offscreen->width;
    uint32_t height = offscreen->height;
    uint32_t attachment_count = offscreen->attachment_count;
    VkFormat *attachment_formats = offscreen->attachment_formats;
    bool include_depth = offscreen->include_depth;

    uint32_t total_attachment_count = attachment_count + (include_depth ? 1 : 0);

    for (uint32_t i = 0; i < attachment_count; i++) {
        init_vulkan_frame_attachment(vk_state, &offscreen->attachments[i], attachment_formats[i], VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT, width, height);
    }

    if (offscreen->include_depth) {
        VkFormat depth_format = vk_find_depth_format(vk_state);
        init_vulkan_frame_attachment(vk_state, &offscreen->depth_attachment, depth_format, VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT, width, height);
    }

    VkAttachmentDescription *attachment_descriptions = safe_calloc(total_attachment_count, sizeof(VkAttachmentDescription));

    for (uint32_t i = 0; i < total_attachment_count; i++) {
        attachment_descriptions[i].samples = VK_SAMPLE_COUNT_1_BIT;
        attachment_descriptions[i].loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
        attachment_descriptions[i].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
        attachment_descriptions[i].stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
        attachment_descriptions[i].stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
        attachment_descriptions[i].initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;

        if (include_depth && i == total_attachment_count - 1) {
            attachment_descriptions[i].finalLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            attachment_descriptions[i].format = offscreen->depth_attachment.format;
        } else {
            attachment_descriptions[i].finalLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            attachment_descriptions[i].format = offscreen->attachments[i].format;
        }
    }

    VkAttachmentReference *color_reference = safe_calloc(attachment_count, sizeof(VkAttachmentReference));

    for (uint32_t i = 0; i < attachment_count; i++) {
        color_reference[i] = (VkAttachmentReference){.attachment = i, .layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL};
    }

    VkAttachmentReference depth_reference = {0};

    VkSubpassDescription subpass = {0};
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.pColorAttachments = color_reference;
    subpass.colorAttachmentCount = attachment_count;

    if (include_depth) {
        depth_reference = (VkAttachmentReference){.attachment = (total_attachment_count - 1), .layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL};
        subpass.pDepthStencilAttachment = &depth_reference;
    }

    VkSubpassDependency dependencies[2];
    memset(dependencies, 0, 2 * sizeof(VkSubpassDependency));

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
    render_pass_info.attachmentCount = total_attachment_count;
    render_pass_info.pAttachments = attachment_descriptions;
    render_pass_info.subpassCount = 1;
    render_pass_info.pSubpasses = &subpass;
    render_pass_info.dependencyCount = 2;
    render_pass_info.pDependencies = dependencies;

    VK_RESULT_OK(vkCreateRenderPass(vk_state->vk_device, &render_pass_info, NULL, &offscreen->render_pass));

    VkImageView *views = safe_calloc(total_attachment_count, sizeof(VkImageView));

    for (uint32_t i = 0; i < attachment_count; i++) {
        views[i] = offscreen->attachments[i].view;
    }

    if (include_depth) {
        views[total_attachment_count - 1] = offscreen->depth_attachment.view;
    }

    VkFramebufferCreateInfo create_info = {0};
    create_info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
    create_info.pNext = NULL;
    create_info.renderPass = offscreen->render_pass;
    create_info.pAttachments = views;
    create_info.attachmentCount = total_attachment_count;
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

    free(attachment_descriptions);
    free(color_reference);
    free(views);

    VkSemaphoreCreateInfo semaphore_info = {0};
    semaphore_info.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

    VK_RESULT_OK(vkCreateSemaphore(vk_state->vk_device, &semaphore_info, NULL, &offscreen->semaphore));

    offscreen->command_buffers = vulkan_util_create_command_buffers(vk_state, vk_base->vk_command_pool, vk_base->swapchain->swapchain_image_count);

    prepare_descriptors(vk_state, vk_base, offscreen);
}

vulkan_offscreen_buffer *create_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, uint32_t width, uint32_t height, uint32_t attachment_count, VkFormat *attachment_formats, bool include_depth) {

    vulkan_offscreen_buffer *offscreen = safe_calloc(1, sizeof(vulkan_offscreen_buffer));

    offscreen->width = width;
    offscreen->height = height;
    offscreen->attachment_count = attachment_count;
    offscreen->attachment_formats = safe_calloc(attachment_count, sizeof(VkFormat));
    offscreen->attachments = safe_calloc(attachment_count, sizeof(struct vulkan_frame_attachment));
    offscreen->include_depth = include_depth;

    memcpy(offscreen->attachment_formats, attachment_formats, attachment_count * sizeof(VkFormat));

    prepare_vulkan_offscreen_buffer(vk_state, vk_base, offscreen);

    return offscreen;
}

static void delete_vulkan_frame_attachment(vulkan_state *vk_state, struct vulkan_frame_attachment *attachment) {

    vkDestroyImageView(vk_state->vk_device, attachment->view, NULL);
    vkDestroyImage(vk_state->vk_device, attachment->image, NULL);
    vkFreeMemory(vk_state->vk_device, attachment->memory, NULL);
}

void vulkan_offscreen_buffer_clean(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self) {

    vkFreeCommandBuffers(vk_state->vk_device, vk_base->vk_command_pool, vk_base->swapchain->swapchain_image_count, self->command_buffers);

    vkDestroyRenderPass(vk_state->vk_device, self->render_pass, NULL);
}

void vulkan_offscreen_buffer_recreate(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *self) {
}

void delete_vulkan_offscreen_buffer(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    for (uint32_t i = 0; i < offscreen->attachment_count; i++) {
        delete_vulkan_frame_attachment(vk_state, &offscreen->attachments[i]);
    }

    if (offscreen->include_depth) {
        delete_vulkan_frame_attachment(vk_state, &offscreen->depth_attachment);
    }

    vkDestroyDescriptorPool(vk_state->vk_device, offscreen->descriptor_pool, NULL);
    vkDestroyDescriptorSetLayout(vk_state->vk_device, offscreen->descriptor_set_layout, NULL);

    vulkan_offscreen_buffer_clean(vk_state, vk_base, offscreen);

    vkDestroySampler(vk_state->vk_device, offscreen->color_sampler, NULL);
    vkDestroyFramebuffer(vk_state->vk_device, offscreen->buffer, NULL);
    vkDestroySemaphore(vk_state->vk_device, offscreen->semaphore, NULL);

    free(offscreen->command_buffers);
}

VkCommandBuffer vulkan_offscreen_buffer_begin_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen, uint32_t image_index) {

    VkCommandBuffer command_buffer = offscreen->command_buffers[image_index];

    VkCommandBufferBeginInfo command_begin_info = {0};
    command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;

    VK_RESULT_OK(vkBeginCommandBuffer(command_buffer, &command_begin_info));

    return command_buffer;
}

void vulkan_offscreen_buffer_begin_render_pass(vulkan_offscreen_buffer *offscreen, VkCommandBuffer command_buffer) {

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

    vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

    vkCmdSetViewport(command_buffer, 0, 1, &viewport);
    vkCmdSetScissor(command_buffer, 0, 1, &scissor);
}

void vulkan_offscreen_buffer_end_recording(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen, uint32_t image_index) {

    vkCmdEndRenderPass(offscreen->command_buffers[image_index]);
    VK_RESULT_OK(vkEndCommandBuffer(offscreen->command_buffers[image_index]));
}
