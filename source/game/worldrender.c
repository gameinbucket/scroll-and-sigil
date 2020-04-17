#include "worldrender.h"

void render_wall(renderbuffer *b, wall *w) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = w->va.x;
    vertices[pos + 1] = w->ceil;
    vertices[pos + 2] = w->va.y;
    vertices[pos + 3] = w->u;
    vertices[pos + 4] = w->t;

    vertices[pos + 5] = w->va.x;
    vertices[pos + 6] = w->floor;
    vertices[pos + 7] = w->va.y;
    vertices[pos + 8] = w->u;
    vertices[pos + 9] = w->v;

    vertices[pos + 5] = w->vb.x;
    vertices[pos + 6] = w->floor;
    vertices[pos + 7] = w->vb.y;
    vertices[pos + 8] = w->s;
    vertices[pos + 9] = w->v;

    vertices[pos + 5] = w->vb.x;
    vertices[pos + 6] = w->ceil;
    vertices[pos + 7] = w->vb.y;
    vertices[pos + 8] = w->s;
    vertices[pos + 9] = w->t;

    b->vertex_pos += 30;
    render_index4(b);
}

void render_triangle(renderbuffer *b, triangle *t) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = t->vc.x;
    vertices[pos + 1] = t->height;
    vertices[pos + 2] = t->vc.y;
    vertices[pos + 3] = t->uv3.x;
    vertices[pos + 4] = t->uv3.y;

    vertices[pos + 5] = t->vb.x;
    vertices[pos + 6] = t->height;
    vertices[pos + 7] = t->vb.y;
    vertices[pos + 8] = t->uv2.x;
    vertices[pos + 9] = t->uv2.y;

    vertices[pos + 10] = t->va.x;
    vertices[pos + 11] = t->height;
    vertices[pos + 12] = t->va.y;
    vertices[pos + 13] = t->uv1.x;
    vertices[pos + 14] = t->uv1.y;

    b->vertex_pos += 15;
    render_index3(b);
}

void thing_render(renderbuffer *b, thing *t, float camera_x, float camera_z) {
    float sine = camera_x - t->x;
    float cosine = camera_z - t->z;
    float length = sqrt(sine * sine + cosine * cosine);
    sine /= length;
    cosine /= length;
    render_sprite3d(b, t->x, t->y, t->z, sine, cosine, t->sp);
}

void sector_render(renderbuffer *b, sector *s) {
    line **lines = s->lines;
    triangle **triangles = s->triangles;

    int line_count = s->line_count;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < line_count; i++) {
        line *ld = lines[i];

        if (ld->bottom) {
            render_wall(b, ld->bottom);
        }

        if (ld->middle) {
            render_wall(b, ld->middle);
        }

        if (ld->top) {
            render_wall(b, ld->top);
        }
    }

    for (int i = 0; i < triangle_count; i++) {
        triangle *td = triangles[i];
        render_triangle(b, td);
    }
}

void world_render(renderstate *rs, world *w, camera *c) {

    renderstate_set_program(rs, SHADER_TEXTURE_3D);
    renderstate_set_mvp(rs, rs->modelviewprojection);

    renderbuffer *draw_sprites = rs->draw_sprites;
    renderbuffer_zero(draw_sprites);

    for (int i = 0; i < w->thing_count; i++) {
        thing_render(draw_sprites, w->things[i], c->x, c->z);
    }

    renderstate_set_texture(rs, TEXTURE_BARON);
    graphics_update_and_draw(draw_sprites);

    renderbuffer *draw_sectors = rs->draw_sectors;
    renderbuffer_zero(draw_sectors);

    int sector_count = w->sector_count;
    sector **sectors = w->sectors;
    for (int i = 0; i < sector_count; i++) {
        sector_render(draw_sectors, sectors[i]);
    }

    renderstate_set_texture(rs, TEXTURE_PLANK);
    graphics_update_and_draw(draw_sectors);
}
