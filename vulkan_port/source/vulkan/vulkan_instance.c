#include "vulkan_instance.h"

static VKAPI_ATTR VkBool32 VKAPI_CALL debug_callback_func(__attribute__((unused)) VkDebugUtilsMessageSeverityFlagBitsEXT message_severity,
                                                          __attribute__((unused)) VkDebugUtilsMessageTypeFlagsEXT message_type, const VkDebugUtilsMessengerCallbackDataEXT *callback_data,
                                                          __attribute__((unused)) void *user_data) {

    fprintf(stderr, "\n(Vulkan) %s\n\n", callback_data->pMessage);
    fflush(stderr);

    return VK_FALSE;
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

VkResult create_debug_messenger(VkInstance instance, const VkDebugUtilsMessengerCreateInfoEXT *create_info, const VkAllocationCallbacks *allocator, VkDebugUtilsMessengerEXT *debug_messenger) {

    PFN_vkCreateDebugUtilsMessengerEXT func = (PFN_vkCreateDebugUtilsMessengerEXT)vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT");
    if (func != NULL) {
        return func(instance, create_info, allocator, debug_messenger);
    } else {
        return VK_ERROR_EXTENSION_NOT_PRESENT;
    }
}

void initialize_vulkan_instance(SDL_Window *window, vulkan_state *vk_state) {

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

    free(vk_extension_names);
#endif

    free(vk_sdl_extension_names);
}
