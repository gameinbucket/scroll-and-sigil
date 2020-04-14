#include "triangle.h"

triangle *triangle_init(float height, int texture, vec va, vec vb, vec vc, bool floor, float scale) {
    triangle *td = safe_malloc(sizeof(triangle));
    td->height = height;
    td->texture = texture;
    td->va = va;
    td->vb = vb;
    td->vc = vc;
    td->uv1 = (vec){va.x * scale, va.y * scale};
    td->uv2 = (vec){vb.x * scale, vb.y * scale};
    td->uv3 = (vec){vc.x * scale, vc.y * scale};
    td->normal = floor ? 1.0 : -1.0;
    return td;
}
