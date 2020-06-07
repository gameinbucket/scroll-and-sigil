#include "vulkan_state.h"

struct swapchain_support_details vk_query_swapchain_support(vulkan_state *vk_state, VkPhysicalDevice device) {

    struct swapchain_support_details details = {(VkSurfaceCapabilitiesKHR){0}, NULL, 0, NULL, 0};
    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(device, vk_state->vk_surface, &details.capabilities);

    uint32_t format_count;
    vkGetPhysicalDeviceSurfaceFormatsKHR(device, vk_state->vk_surface, &format_count, NULL);
    details.format_count = format_count;

    if (format_count != 0) {
        details.formats = safe_calloc(format_count, sizeof(VkSurfaceFormatKHR));
        vkGetPhysicalDeviceSurfaceFormatsKHR(device, vk_state->vk_surface, &format_count, details.formats);
    } else {
        details.formats = NULL;
    }

    uint32_t present_mode_count;
    vkGetPhysicalDeviceSurfacePresentModesKHR(device, vk_state->vk_surface, &present_mode_count, NULL);
    details.present_mode_count = present_mode_count;

    if (present_mode_count != 0) {
        details.present_modes = safe_calloc(present_mode_count, sizeof(VkPresentModeKHR));
        vkGetPhysicalDeviceSurfacePresentModesKHR(device, vk_state->vk_surface, &present_mode_count, details.present_modes);
    } else {
        details.present_modes = NULL;
    }

    return details;
}

void free_swapchain_support_details(struct swapchain_support_details *self) {

    if (self->format_count != 0) {
        free(self->formats);
    }

    if (self->present_mode_count != 0) {
        free(self->present_modes);
    }
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

static bool is_vk_physical_device_device_suitable(vulkan_state *vk_state, VkPhysicalDevice device) {

    VkPhysicalDeviceProperties vk_device_properties = {0};
    VkPhysicalDeviceFeatures vk_device_features = {0};

    vkGetPhysicalDeviceProperties(device, &vk_device_properties);
    vkGetPhysicalDeviceFeatures(device, &vk_device_features);

    if (!vk_device_features.samplerAnisotropy) {
        return false;
    }

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

        if (graphics_family_found && present_family_found) {
            break;
        }
    }

    free(queue_families);

    bool extension_support = vk_check_extension_support(device);
    bool swapchain_good = false;
    if (extension_support) {
        struct swapchain_support_details swapchain_details = vk_query_swapchain_support(vk_state, device);
        swapchain_good = swapchain_details.format_count > 0 && swapchain_details.present_mode_count > 0;
        free_swapchain_support_details(&swapchain_details);
    }

    return present_family_found && graphics_family_found && extension_support && swapchain_good;
}

bool vk_choose_physical_device(vulkan_state *vk_state) {

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

        if (is_vk_physical_device_device_suitable(vk_state, device)) {
            vk_state->vk_physical_device = device;
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

    uint32_t unique_queue_families[2] = {vk_state->graphics_family_index, vk_state->present_family_index};

    int queue_count = 2;

    if (vk_state->graphics_family_index == vk_state->present_family_index) {
        queue_count = 1;
    }

    VkDeviceQueueCreateInfo *vk_queue_info_list = safe_calloc(queue_count, sizeof(VkDeviceQueueCreateInfo));

    for (int i = 0; i < queue_count; i++) {

        VkDeviceQueueCreateInfo vk_queue_info = {0};
        vk_queue_info.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        vk_queue_info.queueFamilyIndex = unique_queue_families[i];
        vk_queue_info.queueCount = 1;
        vk_queue_info.pQueuePriorities = &queue_priority;

        vk_queue_info_list[i] = vk_queue_info;
    }

    VkPhysicalDeviceFeatures vk_device_features = {0};
    vk_device_features.samplerAnisotropy = VK_TRUE;

    VkDeviceCreateInfo vk_create_info = {0};
    vk_create_info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    vk_create_info.pQueueCreateInfos = vk_queue_info_list;
    vk_create_info.queueCreateInfoCount = queue_count;
    vk_create_info.pEnabledFeatures = &vk_device_features;
    vk_create_info.enabledExtensionCount = VULKAN_DEVICE_EXTENSION_COUNT;
    vk_create_info.ppEnabledExtensionNames = VULKAN_DEVICE_EXTENSIONS;

    if (vkCreateDevice(vk_state->vk_physical_device, &vk_create_info, NULL, &vk_state->vk_device) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Device\n");
        exit(1);
    }

    free(vk_queue_info_list);

    vkGetDeviceQueue(vk_state->vk_device, vk_state->graphics_family_index, 0, &vk_state->vk_graphics_queue);
    vkGetDeviceQueue(vk_state->vk_device, vk_state->present_family_index, 0, &vk_state->vk_present_queue);
}

void initialize_vulkan_state(vulkan_state *vk_state) {

    vk_choose_physical_device(vk_state);
    vk_create_logical_device(vk_state);
}

void delete_debug_utils_messennger(VkInstance instance, VkDebugUtilsMessengerEXT debug_messenger, const VkAllocationCallbacks *allocator) {

    PFN_vkDestroyDebugUtilsMessengerEXT func = (PFN_vkDestroyDebugUtilsMessengerEXT)vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT");
    if (func != NULL) {
        func(instance, debug_messenger, allocator);
    }
}

void delete_vulkan_state(vulkan_state *vk_state) {

    printf("delete vulkan state %p\n", (void *)vk_state);

    vkDestroyDevice(vk_state->vk_device, NULL);

#ifdef VULKAN_ENABLE_VALIDATION
    delete_debug_utils_messennger(vk_state->vk_instance, vk_state->vk_debug_messenger, NULL);
#endif

    vkDestroySurfaceKHR(vk_state->vk_instance, vk_state->vk_surface, NULL);
    vkDestroyInstance(vk_state->vk_instance, NULL);
}
