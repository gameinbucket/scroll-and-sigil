#include "worldrender.h"

static void render_wall(renderbuffer *b, wall *w) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = w->va.x;
    vertices[pos + 1] = w->ceiling;
    vertices[pos + 2] = w->va.y;
    vertices[pos + 3] = w->u;
    vertices[pos + 4] = w->t;

    vertices[pos + 5] = w->va.x;
    vertices[pos + 6] = w->floor;
    vertices[pos + 7] = w->va.y;
    vertices[pos + 8] = w->u;
    vertices[pos + 9] = w->v;

    vertices[pos + 10] = w->vb.x;
    vertices[pos + 11] = w->floor;
    vertices[pos + 12] = w->vb.y;
    vertices[pos + 13] = w->s;
    vertices[pos + 14] = w->v;

    vertices[pos + 15] = w->vb.x;
    vertices[pos + 16] = w->ceiling;
    vertices[pos + 17] = w->vb.y;
    vertices[pos + 18] = w->s;
    vertices[pos + 19] = w->t;

    b->vertex_pos = pos + 20;
    render_index4(b);
}

static void render_triangle(renderbuffer *b, triangle *t) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = t->vc.x;
    vertices[pos + 1] = t->height;
    vertices[pos + 2] = t->vc.y;
    vertices[pos + 3] = t->u3;
    vertices[pos + 4] = t->v3;

    vertices[pos + 5] = t->vb.x;
    vertices[pos + 6] = t->height;
    vertices[pos + 7] = t->vb.y;
    vertices[pos + 8] = t->u2;
    vertices[pos + 9] = t->v2;

    vertices[pos + 10] = t->va.x;
    vertices[pos + 11] = t->height;
    vertices[pos + 12] = t->va.y;
    vertices[pos + 13] = t->u1;
    vertices[pos + 14] = t->v1;

    b->vertex_pos = pos + 15;
    render_index3(b);
}

static void thing_render(renderbuffer *b, thing *t, float sine, float cosine) {
    render_sprite3d(b, t->x, t->y, t->z, sine, cosine, t->sp);
}

static void sector_render(renderbuffer *b, sector *s) {
    line **lines = s->lines;
    int line_count = s->line_count;

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

    triangle **triangles = s->triangles;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < triangle_count; i++) {
        render_triangle(b, triangles[i]);
    }
}

void world_render(renderstate *rs, world *w, camera *c) {

    if (c->x == -999) {
        return;
    }

    renderstate_set_program(rs, SHADER_TEXTURE_3D);
    renderstate_set_mvp(rs, rs->modelviewprojection);

    float sine = sinf(-c->ry);
    float cosine = cosf(-c->ry);
    renderbuffer *draw_sprites = rs->draw_sprites;
    renderbuffer_zero(draw_sprites);
    thing **things = w->things;
    int thing_count = w->thing_count;
    for (int i = 0; i < thing_count; i++) {
        thing_render(draw_sprites, things[i], sine, cosine);
    }
    renderstate_set_texture(rs, TEXTURE_BARON);
    graphics_bind_and_draw(draw_sprites);

    renderbuffer *draw_sectors = rs->draw_sectors;
    renderbuffer_zero(draw_sectors);
    sector **sectors = w->sectors;
    int sector_count = w->sector_count;
    for (int i = 0; i < sector_count; i++) {
        sector_render(draw_sectors, sectors[i]);
    }
    renderstate_set_texture(rs, TEXTURE_PLANK);
    graphics_bind_and_draw(draw_sectors);

    int pos = draw_sectors->vertex_pos;
    GLfloat *vertices = draw_sectors->vertices;
    printf("-------------- %d | ", pos);
    for (int i = 0; i < pos; i++) {
        printf("%f, ", vertices[i]);
    }
    printf("\n\n");
}
