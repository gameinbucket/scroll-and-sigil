#include "wad.h"

void wad_load_resources(renderstate *rs) {

    struct zip *z = NULL;
    const bool use_zip = false;

    if (use_zip) {
        z = open_zip_archive("scroll-and-sigil.pack");
    }

    rs->shaders = safe_malloc(SHADER_COUNT * sizeof(shader *));
    rs->shaders[SHADER_TEXTURE_2D] = create_shader(z, "shaders/spv/texture2d.vert.spv", "shaders/spv/texture2d.frag.spv");
    rs->shaders[SHADER_TEXTURE_3D] = create_shader(z, "shaders/spv/texture3d.vert.spv", "shaders/spv/texture3d.frag.spv");

    if (use_zip) {
        zip_close(z);
    }
}
