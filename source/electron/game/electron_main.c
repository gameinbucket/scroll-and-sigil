#include "electron_main.h"

EM_JS(void, two_alerts, (), {
    alert('hai');
    alert('bai');
})

int EMSCRIPTEN_KEEPALIVE main() {
    printf("----------------------------------------------------------------------\n");

    // EmscriptenWebGLContextAttributes attribs;
    // emscripten_webgl_init_context_attributes(&attribs);
    // attribs.alpha = false;
    // attribs.enableExtensionsByDefault = false;
    // EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context = emscripten_webgl_create_context("display", &attribs);
    // emscripten_webgl_make_context_current(context);
    // emscripten_set_resize_callback(0, this, false, OnResize);
    // emscripten_set_blur_callback("#window", NULL, false, OnBlur);
    // emscripten_set_focus_callback("#window", NULL, false, OnFocus);

    printf("\n");
    two_alerts();
    return 0;
}
