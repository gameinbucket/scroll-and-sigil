#include "vulkan_init.h"

static VKAPI_ATTR VkBool32 VKAPI_CALL debug_callback_func(__attribute__((unused)) VkDebugUtilsMessageSeverityFlagBitsEXT message_severity,
                                                          __attribute__((unused)) VkDebugUtilsMessageTypeFlagsEXT message_type, const VkDebugUtilsMessengerCallbackDataEXT *callback_data,
                                                          __attribute__((unused)) void *user_data) {

    fprintf(stderr, "\n(Vulkan) %s\n\n", callback_data->pMessage);
    fflush(stderr);

    return VK_FALSE;
}

VkResult create_debug_messenger(VkInstance instance, const VkDebugUtilsMessengerCreateInfoEXT *create_info, const VkAllocationCallbacks *allocator, VkDebugUtilsMessengerEXT *debug_messenger) {

    PFN_vkCreateDebugUtilsMessengerEXT func = (PFN_vkCreateDebugUtilsMessengerEXT)vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT");
    if (func != NULL) {
        return func(instance, create_info, allocator, debug_messenger);
    } else {
        return VK_ERROR_EXTENSION_NOT_PRESENT;
    }
}

static bool check_validation_support() {

    uint32_t validation_count;
    vkEnumerateInstanceLayerProperties(&validation_count, NULL);

    VkLayerProperties *validation_layers = safe_calloc(validation_count, sizeof(VkLayerProperties));
    vkEnumerateInstanceLayerProperties(&validation_count, validation_layers);

    bool good = true;

    for (int i = 0; i < VULKAN_VALIDATION_LAYER_COUNT; i++) {
        bool found = false;
        for (uint32_t j = 0; j < validation_count; j++) {
            if (strcmp(VULKAN_VALIDATION_LAYERS[i], validation_layers[j].layerName) == 0) {
                found = true;
                break;
            }
        }
        if (!found) {
            good = false;
            break;
        }
    }

    free(validation_layers);

    return good;
}

void vk_create_instance(SDL_Window *window, vulkan_state *vk_state) {

#ifdef VULKAN_ENABLE_VALIDATION
    if (!check_validation_support()) {
        fprintf(stderr, "Error: No vulkan validation support\n");
        exit(1);
    }
#endif

    uint32_t vk_sdl_extension_count;
    SDL_Vulkan_GetInstanceExtensions(window, &vk_sdl_extension_count, NULL);

    const char **vk_sdl_extension_names = safe_calloc(vk_sdl_extension_count, sizeof(char *));
    SDL_Vulkan_GetInstanceExtensions(window, &vk_sdl_extension_count, vk_sdl_extension_names);

#ifdef VULKAN_ENABLE_VALIDATION
    uint32_t vk_extension_count = vk_sdl_extension_count + 1;
    const char **vk_extension_names = safe_calloc(vk_extension_count, sizeof(char *));
    memcpy(vk_extension_names, vk_sdl_extension_names, vk_sdl_extension_count * sizeof(char *));
    vk_extension_names[vk_sdl_extension_count] = VK_EXT_DEBUG_UTILS_EXTENSION_NAME;
#else
    uint32_t vk_extension_count = vk_sdl_extension_count;
    const char **vk_extension_names = vk_sdl_extension_names;
#endif

    VkApplicationInfo vk_app = {0};
    vk_app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    vk_app.pNext = NULL;
    vk_app.pApplicationName = "Scroll And Sigil Vulkan";
    vk_app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    vk_app.pEngineName = "None";
    vk_app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    vk_app.apiVersion = VK_API_VERSION_1_0;

    VkInstanceCreateInfo vk_info = {0};
    vk_info.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    vk_info.flags = 0;
    vk_info.pApplicationInfo = &vk_app;
    vk_info.ppEnabledExtensionNames = vk_extension_names;
    vk_info.enabledExtensionCount = vk_extension_count;

#ifdef VULKAN_ENABLE_VALIDATION
    vk_info.ppEnabledLayerNames = VULKAN_VALIDATION_LAYERS;
    vk_info.enabledLayerCount = VULKAN_VALIDATION_LAYER_COUNT;

    VkDebugUtilsMessengerCreateInfoEXT debug_info = {0};
    debug_info.sType = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
    debug_info.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
    debug_info.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
    debug_info.pfnUserCallback = debug_callback_func;

    vk_info.pNext = (VkDebugUtilsMessengerCreateInfoEXT *)&debug_info;
#else
    vk_info.ppEnabledLayerNames = NULL;
    vk_info.enabledLayerCount = 0;
    vk_info.pNext = NULL;
#endif

    if (vkCreateInstance(&vk_info, NULL, &vk_state->vk_instance) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Instance\n");
        exit(1);
    }

#ifdef VULKAN_ENABLE_VALIDATION
    if (create_debug_messenger(vk_state->vk_instance, &debug_info, NULL, &vk_state->vk_debug_messenger) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Debug Utils Messenger\n");
        exit(1);
    }
#endif
}

static struct swapchain_support_details vk_query_swapchain_support(vulkan_state *vk_state, VkPhysicalDevice device) {

    struct swapchain_support_details details;
    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(device, vk_state->vk_surface, &details.capabilities);

    uint32_t format_count;
    vkGetPhysicalDeviceSurfaceFormatsKHR(device, vk_state->vk_surface, &format_count, NULL);

    if (format_count != 0) {
        details.formats = safe_calloc(format_count, sizeof(VkSurfaceFormatKHR));
        vkGetPhysicalDeviceSurfaceFormatsKHR(device, vk_state->vk_surface, &format_count, details.formats);
    } else {
        details.formats = NULL;
    }
    details.format_count = format_count;

    uint32_t present_mode_count;
    vkGetPhysicalDeviceSurfacePresentModesKHR(device, vk_state->vk_surface, &present_mode_count, NULL);

    if (present_mode_count != 0) {
        details.present_modes = safe_calloc(present_mode_count, sizeof(VkPresentModeKHR));
        vkGetPhysicalDeviceSurfacePresentModesKHR(device, vk_state->vk_surface, &present_mode_count, details.present_modes);
    } else {
        details.present_modes = NULL;
    }
    details.present_mode_count = present_mode_count;

    return details;
}

static bool vk_check_extension_support(VkPhysicalDevice device) {
    uint32_t extension_count;
    vkEnumerateDeviceExtensionProperties(device, NULL, &extension_count, NULL);

    VkExtensionProperties *extensions = safe_calloc(extension_count, sizeof(VkExtensionProperties));
    vkEnumerateDeviceExtensionProperties(device, NULL, &extension_count, extensions);

    bool good = false;

    for (uint32_t i = 0; i < extension_count; i++) {
        if (strcmp(extensions[i].extensionName, VK_KHR_SWAPCHAIN_EXTENSION_NAME)) {
            good = true;
        }
    }

    free(extensions);

    return good;
}

static bool is_vk_physical_device_suitable(vulkan_state *vk_state, VkPhysicalDevice device) {

    VkPhysicalDeviceProperties vk_device_properties;
    VkPhysicalDeviceFeatures vk_device_features;
    vkGetPhysicalDeviceProperties(device, &vk_device_properties);
    vkGetPhysicalDeviceFeatures(device, &vk_device_features);

    if (vk_device_properties.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU && vk_device_features.geometryShader) {

        bool present_family_found = false;
        bool graphics_family_found = false;

        uint32_t queue_family_count = 0;
        vkGetPhysicalDeviceQueueFamilyProperties(device, &queue_family_count, NULL);

        VkQueueFamilyProperties *queue_families = safe_calloc(queue_family_count, sizeof(VkQueueFamilyProperties));
        vkGetPhysicalDeviceQueueFamilyProperties(device, &queue_family_count, queue_families);

        for (uint32_t i = 0; i < queue_family_count; i++) {

            VkQueueFamilyProperties family = queue_families[i];

            if (family.queueFlags & VK_QUEUE_GRAPHICS_BIT) {
                vk_state->graphics_family_index = i;
                graphics_family_found = true;
            }

            VkBool32 present_support = false;
            vkGetPhysicalDeviceSurfaceSupportKHR(device, i, vk_state->vk_surface, &present_support);

            if (present_support) {
                vk_state->present_family_index = i;
                present_family_found = true;
            }
        }

        free(queue_families);

        bool extension_support = vk_check_extension_support(device);
        bool swapchain_good = false;
        if (extension_support) {
            struct swapchain_support_details swapchain_details = vk_query_swapchain_support(vk_state, device);
            swapchain_good = swapchain_details.format_count > 0 && swapchain_details.present_mode_count > 0;
        }

        return present_family_found && graphics_family_found && extension_support && swapchain_good;
    }

    return false;
}

bool vk_get_physical_device(vulkan_state *vk_state) {

    uint32_t vk_device_count = 0;
    vkEnumeratePhysicalDevices(vk_state->vk_instance, &vk_device_count, NULL);

    if (vk_device_count == 0) {
        fprintf(stderr, "Error: No GPU with vulkan support\n");
        exit(1);
    }

    VkPhysicalDevice *vk_devices = safe_calloc(vk_device_count, sizeof(VkPhysicalDevice));
    vkEnumeratePhysicalDevices(vk_state->vk_instance, &vk_device_count, vk_devices);

    for (uint32_t i = 0; i < vk_device_count; i++) {
        VkPhysicalDevice device = vk_devices[i];

        if (is_vk_physical_device_suitable(vk_state, device)) {
            vk_state->vk_physical = device;
            free(vk_devices);
            return true;
        }
    }

    fprintf(stderr, "Error: No suitable GPU\n");
    exit(1);

    return false;
}

void vk_create_logical_device(vulkan_state *vk_state) {

    const float queue_priority = 1.0f;

    int queue_count = 2;
    uint32_t queue_families[2] = {vk_state->present_family_index, vk_state->graphics_family_index};

    VkDeviceQueueCreateInfo vk_queue_info_list[2];

    for (int i = 0; i < queue_count; i++) {
        VkDeviceQueueCreateInfo vk_queue_info = {0};
        vk_queue_info.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        vk_queue_info.queueFamilyIndex = queue_families[i];
        vk_queue_info.queueCount = 1;
        vk_queue_info.pQueuePriorities = &queue_priority;

        vk_queue_info_list[i] = vk_queue_info;
    }

    VkPhysicalDeviceFeatures vk_device_features = {0};

    VkDeviceCreateInfo vk_create_info = {0};
    vk_create_info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    vk_create_info.pQueueCreateInfos = vk_queue_info_list;
    vk_create_info.queueCreateInfoCount = queue_count;
    vk_create_info.pEnabledFeatures = &vk_device_features;
    vk_create_info.enabledExtensionCount = VULKAN_DEVICE_EXTENSION_COUNT;
    vk_create_info.ppEnabledExtensionNames = VULKAN_DEVICE_EXTENSIONS;

    if (vkCreateDevice(vk_state->vk_physical, &vk_create_info, NULL, &vk_state->vk_device) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Device\n");
        exit(1);
    }

    vkGetDeviceQueue(vk_state->vk_device, vk_state->present_family_index, 0, &vk_state->vk_present_queue);
    vkGetDeviceQueue(vk_state->vk_device, vk_state->graphics_family_index, 0, &vk_state->vk_graphics_queue);
}

static VkSurfaceFormatKHR vk_choose_swap_surface_format(VkSurfaceFormatKHR *available, uint32_t count) {
    for (uint32_t i = 0; i < count; i++) {
        VkSurfaceFormatKHR this = available[i];
        if (this.format == VK_FORMAT_B8G8R8A8_SRGB && this.colorSpace == VK_COLOR_SPACE_SRGB_NONLINEAR_KHR) {
            return this;
        }
    }
    return available[0];
}

static VkPresentModeKHR vk_choose_swap_present_mode(VkPresentModeKHR *available, uint32_t count) {
    for (uint32_t i = 0; i < count; i++) {
        VkPresentModeKHR this = available[i];
        if (this == VK_PRESENT_MODE_MAILBOX_KHR) {
            return this;
        }
    }
    return VK_PRESENT_MODE_FIFO_KHR;
}

static VkExtent2D vk_choose_swap_extent(VkSurfaceCapabilitiesKHR capabilities, uint32_t width, uint32_t height) {
    if (capabilities.currentExtent.width != UINT32_MAX) {
        return capabilities.currentExtent;
    }

    VkExtent2D extent = {0};

    extent.width = MIN(capabilities.maxImageExtent.width, width);
    extent.height = MIN(capabilities.maxImageExtent.height, height);

    extent.width = MAX(capabilities.minImageExtent.width, extent.width);
    extent.height = MAX(capabilities.minImageExtent.height, extent.height);

    return extent;
}

void vk_create_swapchain(vulkan_state *vk_state, uint32_t width, uint32_t height) {

    struct swapchain_support_details swapchain_details = vk_query_swapchain_support(vk_state, vk_state->vk_physical);

    VkSurfaceFormatKHR surface_format = vk_choose_swap_surface_format(swapchain_details.formats, swapchain_details.format_count);
    VkPresentModeKHR present_mode = vk_choose_swap_present_mode(swapchain_details.present_modes, swapchain_details.present_mode_count);
    VkExtent2D extent = vk_choose_swap_extent(swapchain_details.capabilities, width, height);

    vk_state->swapchain_image_format = surface_format.format;
    vk_state->swapchain_extent = extent;

    uint32_t swapchain_image_count;

    if (swapchain_details.capabilities.maxImageCount > 0) {
        swapchain_image_count = swapchain_details.capabilities.maxImageCount;
    } else {
        swapchain_image_count = swapchain_details.capabilities.minImageCount + 1;
    }

    VkSwapchainCreateInfoKHR vk_swapchain_info = {0};
    vk_swapchain_info.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
    vk_swapchain_info.surface = vk_state->vk_surface;
    vk_swapchain_info.minImageCount = swapchain_image_count;
    vk_swapchain_info.imageFormat = surface_format.format;
    vk_swapchain_info.imageColorSpace = surface_format.colorSpace;
    vk_swapchain_info.imageExtent = extent;
    vk_swapchain_info.imageArrayLayers = 1;
    vk_swapchain_info.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
    vk_swapchain_info.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
    vk_swapchain_info.presentMode = present_mode;
    vk_swapchain_info.clipped = VK_TRUE;
    vk_swapchain_info.preTransform = swapchain_details.capabilities.currentTransform;
    vk_swapchain_info.oldSwapchain = VK_NULL_HANDLE;

    uint32_t queue_families[2] = {vk_state->present_family_index, vk_state->graphics_family_index};

    if (vk_state->present_family_index != vk_state->graphics_family_index) {
        vk_swapchain_info.imageSharingMode = VK_SHARING_MODE_CONCURRENT;
        vk_swapchain_info.queueFamilyIndexCount = 2;
        vk_swapchain_info.pQueueFamilyIndices = queue_families;
    } else {
        vk_swapchain_info.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
    }

    if (vkCreateSwapchainKHR(vk_state->vk_device, &vk_swapchain_info, NULL, &vk_state->vk_swapchain) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Swapchain\n");
        exit(1);
    }

    vkGetSwapchainImagesKHR(vk_state->vk_device, vk_state->vk_swapchain, &swapchain_image_count, NULL);

    VkImage *swapchain_images = safe_calloc(swapchain_image_count, sizeof(VkImage));
    vkGetSwapchainImagesKHR(vk_state->vk_device, vk_state->vk_swapchain, &swapchain_image_count, swapchain_images);

    vk_state->swapchain_images = swapchain_images;
    vk_state->swapchain_image_count = swapchain_image_count;
}

void vk_create_image_views(vulkan_state *vk_state) {

    uint32_t count = vk_state->swapchain_image_count;

    VkImageView *swapchain_image_views = safe_calloc(count, sizeof(VkImageView));

    for (uint32_t i = 0; i < count; i++) {

        VkImageViewCreateInfo vk_image_view_info = {0};
        vk_image_view_info.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
        vk_image_view_info.image = vk_state->swapchain_images[i];
        vk_image_view_info.viewType = VK_IMAGE_VIEW_TYPE_2D;
        vk_image_view_info.format = vk_state->swapchain_image_format;
        vk_image_view_info.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
        vk_image_view_info.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
        vk_image_view_info.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
        vk_image_view_info.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
        vk_image_view_info.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        vk_image_view_info.subresourceRange.baseMipLevel = 0;
        vk_image_view_info.subresourceRange.levelCount = 1;
        vk_image_view_info.subresourceRange.baseArrayLayer = 0;
        vk_image_view_info.subresourceRange.layerCount = 1;

        if (vkCreateImageView(vk_state->vk_device, &vk_image_view_info, NULL, &swapchain_image_views[i]) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan Create Image View\n");
            exit(1);
        }
    }

    vk_state->swapchain_image_views = swapchain_image_views;
}

void vk_clean_swapchain(vulkan_state *vk_state) {

    VkDevice device = vk_state->vk_device;

    for (uint32_t i = 0; i < vk_state->swapchain_image_count; i++) {
        vkDestroyFramebuffer(device, vk_state->vk_framebuffers[i], NULL);
    }

    vkFreeCommandBuffers(device, vk_state->vk_command_pool, vk_state->swapchain_image_count, vk_state->vk_command_buffers);

    vkDestroyPipeline(device, vk_state->vk_pipeline, NULL);
    vkDestroyPipelineLayout(device, vk_state->vk_pipeline_layout, NULL);
    vkDestroyRenderPass(device, vk_state->vk_render_pass, NULL);

    for (uint32_t i = 0; i < vk_state->swapchain_image_count; i++) {
        vkDestroyImageView(device, vk_state->swapchain_image_views[i], NULL);
    }

    vkDestroySwapchainKHR(device, vk_state->vk_swapchain, NULL);
}

void vk_recreate_swapchain(vulkan_state *vk_state, uint32_t width, uint32_t height) {

    vkDeviceWaitIdle(vk_state->vk_device);

    vk_clean_swapchain(vk_state);

    vk_create_swapchain(vk_state, width, height);
    vk_create_image_views(vk_state);
    vk_create_render_pass(vk_state);
    vk_create_graphics_pipeline(vk_state);
    vk_create_framebuffers(vk_state);
    vk_create_command_buffers(vk_state);
}

void vk_create(vulkan_state *vk_state, uint32_t width, uint32_t height) {

    vk_get_physical_device(vk_state);
    vk_create_logical_device(vk_state);
    vk_create_swapchain(vk_state, width, height);
    vk_create_image_views(vk_state);
    vk_create_render_pass(vk_state);
    vk_create_graphics_pipeline(vk_state);
    vk_create_framebuffers(vk_state);
    vk_create_command_pool(vk_state);
    vk_create_command_buffers(vk_state);
    vk_create_semaphores(vk_state);
}

void destroy_debug_utils_messennger(VkInstance instance, VkDebugUtilsMessengerEXT debug_messenger, const VkAllocationCallbacks *allocator) {

    PFN_vkDestroyDebugUtilsMessengerEXT func = (PFN_vkDestroyDebugUtilsMessengerEXT)vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT");
    if (func != NULL) {
        func(instance, debug_messenger, allocator);
    }
}

void vk_quit(vulkan_state *vk_state) {

    vk_clean_swapchain(vk_state);

    VkDevice device = vk_state->vk_device;

    for (int i = 0; i < VULKAN_MAX_FRAMES_IN_FLIGHT; i++) {
        vkDestroyFence(device, vk_state->vk_flight_fences[i], NULL);
        vkDestroySemaphore(device, vk_state->vk_image_available_semaphores[i], NULL);
        vkDestroySemaphore(device, vk_state->vk_render_finished_semaphores[i], NULL);
    }

    vkDestroyCommandPool(device, vk_state->vk_command_pool, NULL);

    vkDestroyDevice(device, NULL);

#ifdef VULKAN_ENABLE_VALIDATION
    destroy_debug_utils_messennger(vk_state->vk_instance, vk_state->vk_debug_messenger, NULL);
#endif

    vkDestroySurfaceKHR(vk_state->vk_instance, vk_state->vk_surface, NULL);
    vkDestroyInstance(vk_state->vk_instance, NULL);
}
