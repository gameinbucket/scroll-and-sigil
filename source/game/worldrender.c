#include "worldrender.h"

worldrender *create_worldrender(world *w) {

    worldrender *self = safe_calloc(1, sizeof(worldrender));
    self->w = w;
    self->sector_cache_a = create_uint_table();
    self->sector_cache_b = create_uint_table();
    return self;
}

static void create_cache(uint_table *cache) {

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        struct vulkan_renderbuffer *b = create_renderbuffer(3, 0, 2, 3, 0, 4 * 800, 36 * 800, true);
        uint_table_put(cache, i, b);
    }
}

void worldrender_create_buffers(worldrender *self) {

    create_cache(self->sector_cache_a);
    create_cache(self->sector_cache_b);
}

static void render_wall(struct vulkan_renderbuffer *b, wall *w) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;

    vertices[pos] = w->va.x;
    vertices[pos + 1] = w->ceiling;
    vertices[pos + 2] = w->va.y;
    vertices[pos + 3] = w->u;
    vertices[pos + 4] = w->t;
    vertices[pos + 5] = w->ld->normal.x;
    vertices[pos + 6] = 0;
    vertices[pos + 7] = w->ld->normal.y;

    vertices[pos + 8] = w->va.x;
    vertices[pos + 9] = w->floor;
    vertices[pos + 10] = w->va.y;
    vertices[pos + 11] = w->u;
    vertices[pos + 12] = w->v;
    vertices[pos + 13] = w->ld->normal.x;
    vertices[pos + 14] = 0;
    vertices[pos + 15] = w->ld->normal.y;

    vertices[pos + 16] = w->vb.x;
    vertices[pos + 17] = w->floor;
    vertices[pos + 18] = w->vb.y;
    vertices[pos + 19] = w->s;
    vertices[pos + 20] = w->v;
    vertices[pos + 21] = w->ld->normal.x;
    vertices[pos + 22] = 0;
    vertices[pos + 23] = w->ld->normal.y;

    vertices[pos + 24] = w->vb.x;
    vertices[pos + 25] = w->ceiling;
    vertices[pos + 26] = w->vb.y;
    vertices[pos + 27] = w->s;
    vertices[pos + 28] = w->t;
    vertices[pos + 29] = w->ld->normal.x;
    vertices[pos + 30] = 0;
    vertices[pos + 31] = w->ld->normal.y;

    b->vertex_position = pos + 32;
    render_index4(b);
}

static void render_triangle(struct vulkan_renderbuffer *b, triangle *t) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;

    vertices[pos] = t->vc.x;
    vertices[pos + 1] = t->height;
    vertices[pos + 2] = t->vc.y;
    vertices[pos + 3] = t->u3;
    vertices[pos + 4] = t->v3;
    vertices[pos + 5] = 0;
    vertices[pos + 6] = t->normal;
    vertices[pos + 7] = 0;

    vertices[pos + 8] = t->vb.x;
    vertices[pos + 9] = t->height;
    vertices[pos + 10] = t->vb.y;
    vertices[pos + 11] = t->u2;
    vertices[pos + 12] = t->v2;
    vertices[pos + 13] = 0;
    vertices[pos + 14] = t->normal;
    vertices[pos + 15] = 0;

    vertices[pos + 16] = t->va.x;
    vertices[pos + 17] = t->height;
    vertices[pos + 18] = t->va.y;
    vertices[pos + 19] = t->u1;
    vertices[pos + 20] = t->v1;
    vertices[pos + 21] = 0;
    vertices[pos + 22] = t->normal;
    vertices[pos + 23] = 0;

    b->vertex_position = pos + 24;
    render_index3(b);
}

// static void render_decal(struct vulkan_renderbuffer *b, decal *d) {
//     uint32_t pos = b->vertex_position;
//     float *vertices = b->vertices;

//     vertices[pos] = d->x1;
//     vertices[pos + 1] = d->y1;
//     vertices[pos + 2] = d->z1;
//     vertices[pos + 3] = d->u1;
//     vertices[pos + 4] = d->v1;
//     vertices[pos + 5] = d->nx;
//     vertices[pos + 6] = d->ny;
//     vertices[pos + 7] = d->nz;

//     vertices[pos + 8] = d->x2;
//     vertices[pos + 9] = d->y2;
//     vertices[pos + 10] = d->z2;
//     vertices[pos + 11] = d->u2;
//     vertices[pos + 12] = d->v2;
//     vertices[pos + 13] = d->nx;
//     vertices[pos + 14] = d->ny;
//     vertices[pos + 15] = d->nz;

//     vertices[pos + 16] = d->x3;
//     vertices[pos + 17] = d->y3;
//     vertices[pos + 18] = d->z3;
//     vertices[pos + 19] = d->u3;
//     vertices[pos + 20] = d->v3;
//     vertices[pos + 21] = d->nx;
//     vertices[pos + 22] = d->ny;
//     vertices[pos + 23] = d->nz;

//     vertices[pos + 24] = d->x4;
//     vertices[pos + 25] = d->y4;
//     vertices[pos + 26] = d->z4;
//     vertices[pos + 27] = d->u4;
//     vertices[pos + 28] = d->v4;
//     vertices[pos + 29] = d->nx;
//     vertices[pos + 30] = d->ny;
//     vertices[pos + 31] = d->nz;

//     b->vertex_position = pos + 32;
//     render_index4(b);
// }

static void sector_render(uint_table *cache, sector *s) {
    line **lines = s->lines;
    int line_count = s->line_count;

    for (int i = 0; i < line_count; i++) {
        line *ld = lines[i];

        wall *top = ld->top;
        wall *middle = ld->middle;
        wall *bottom = ld->bottom;

        if (top) {
            struct vulkan_renderbuffer *b = uint_table_get(cache, top->texture);
            render_wall(b, top);
        }

        if (ld->middle) {
            struct vulkan_renderbuffer *b = uint_table_get(cache, middle->texture);
            render_wall(b, middle);
        }

        if (ld->bottom) {
            struct vulkan_renderbuffer *b = uint_table_get(cache, bottom->texture);
            render_wall(b, bottom);
        }
    }

    triangle **triangles = s->triangles;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < triangle_count; i++) {
        triangle *td = triangles[i];
        struct vulkan_renderbuffer *b = uint_table_get(cache, td->texture);
        render_triangle(b, td);
    }
}

void world_render(worldrender *wr) {

    world *w = wr->w;

    uint_table *cache = wr->sector_cache_a;

    sector **sectors = w->sectors;
    int sector_count = w->sector_count;
    for (int i = 0; i < sector_count; i++) {
        sector_render(cache, sectors[i]);
    }
}

void delete_worldrender(worldrender *self) {

    delete_uint_table(self->sector_cache_a);
    delete_uint_table(self->sector_cache_b);
}
