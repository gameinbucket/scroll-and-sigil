#include "worldrender.h"

worldrender *new_worldrender(renderstate *rs, world *w) {
    worldrender *self = safe_calloc(1, sizeof(worldrender));
    self->rs = rs;
    self->w = w;
    self->cache_a = new_uint_table();
    self->cache_b = new_uint_table();
    return self;
}

static void create_cache(uint_table *cache) {
    for (int i = 0; i < TEXTURE_COUNT; i++) {
        renderbuffer *b = create_renderbuffer(3, 0, 2, 3, 4 * 800, 36 * 800, true);
        graphics_make_vao(b);

        uint_table_put(cache, i, b);
    }
}

void worldrender_create_buffers(worldrender *self) {
    create_cache(self->cache_a);
    create_cache(self->cache_b);
}

static void render_wall(renderbuffer *b, wall *w) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

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

    // memcpy(vertices, w->vertices, 20 * sizeof(float));

    b->vertex_pos = pos + 32;
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

    b->vertex_pos = pos + 24;
    render_index3(b);
}

static void thing_render(uint_table *cache, thing *t) {
    renderbuffer *b = uint_table_get(cache, t->sprite_id);

    model *m = t->model_data;
    bone *body = &m->bones[BIPED_BODY];

    body->world_x = t->x;
    body->world_y = t->y + 0.8;
    body->world_z = t->z;

    body->local_ry = t->rotation;

    bone_recursive_compute(body);

    render_model(b, m);
}

static void sector_render(uint_table *cache, sector *s) {
    line **lines = s->lines;
    int line_count = s->line_count;

    for (int i = 0; i < line_count; i++) {
        line *ld = lines[i];

        wall *top = ld->top;
        wall *middle = ld->middle;
        wall *bottom = ld->bottom;

        if (top) {
            renderbuffer *b = uint_table_get(cache, top->texture);
            render_wall(b, top);
        }

        if (ld->middle) {
            renderbuffer *b = uint_table_get(cache, middle->texture);
            render_wall(b, middle);
        }

        if (ld->bottom) {
            renderbuffer *b = uint_table_get(cache, bottom->texture);
            render_wall(b, bottom);
        }
    }

    triangle **triangles = s->triangles;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < triangle_count; i++) {
        triangle *td = triangles[i];
        renderbuffer *b = uint_table_get(cache, td->texture);
        render_triangle(b, td);
    }
}

void world_render(worldrender *wr, camera *c) {

    if (c->x < -999) {
        printf("foobar\n");
    }

    // TODO: Store vertices in memory, then memcpy to gl mapped buffer per texture (or use glBufferSubData)

    renderstate *rs = wr->rs;
    world *w = wr->w;

    wr->current_cache = !wr->current_cache;
    uint_table *cache = wr->current_cache ? wr->cache_a : wr->cache_b;

    uint_table_iterator iter = new_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        renderbuffer *b = pair.value;
        renderbuffer_zero(b);
    }

    thing **things = w->things;
    int thing_count = w->thing_count;
    for (int i = 0; i < thing_count; i++) {
        thing_render(cache, things[i]);
    }

    sector **sectors = w->sectors;
    int sector_count = w->sector_count;
    for (int i = 0; i < sector_count; i++) {
        sector_render(cache, sectors[i]);
    }

    iter = new_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        renderbuffer *b = pair.value;
        renderstate_set_texture(rs, pair.key);
        graphics_bind_and_draw(b);
    }
}

void destroy_worldrender(worldrender *self) {
    destroy_uint_table(self->cache_a);
    destroy_uint_table(self->cache_b);
}
