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

void world_render(renderstate *rs, world *w) {

    int width = w->width;
    int height = w->height;
    int length = w->length;

    int bx = 0;
    int by = 0;
    int bz = 0;

    int all = width + height + length;

    int *blocks = w->blocks;

    float color[12] = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1};
    float uv[4] = {0, 0, 1, 1};

    renderbuffer *cubes = rs->draw_cubes;
    renderbuffer_zero(cubes);

    for (int i = 0; i < all; i++) {
        if (blocks[i] != 0) {
            render_cube_positive_x(cubes, bx, by, bz, color, uv);
        }
        bx++;
        if (bx == width) {
            bx = 0;
            by++;
            if (by == height) {
                by = 0;
                bz++;
            }
        }
    }
}
