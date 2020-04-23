#include "worldrender.h"

worldrender *new_worldrender(renderstate *rs, world *w) {
    worldrender *self = safe_calloc(1, sizeof(worldrender));
    self->rs = rs;
    self->w = w;
    self->cache = new_uint_table();
    return self;
}

void worldrender_create_buffers(worldrender *self) {
    uint_table *cache = self->cache;

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        renderbuffer *b = renderbuffer_init(3, 0, 2, 4 * 200, 36 * 200, true);
        graphics_make_vao(b);

        uint_table_put(cache, i, b);
    }
}

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

    // memcpy(vertices, w->vertices, 20 * sizeof(float));

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

static void thing_render(uint_table *cache, thing *t, float sine, float cosine) {
    // renderbuffer *b = uint_table_get(cache, t->sprite_id);
    // render_sprite3d(b, t->x, t->y, t->z, sine, cosine, t->sprite_data);
    if (sine < -999 || cosine < -999)
        return;
    renderbuffer *b = uint_table_get(cache, TEXTURE_PLANKS);
    render_model(b, t->x, t->y, t->z, t->angle);
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

    // TODO: Store vertices in memory, then memcpy to gl mapped buffer per texture (or use glBufferSubData)

    renderstate *rs = wr->rs;
    world *w = wr->w;
    uint_table *cache = wr->cache;

    renderstate_set_program(rs, SHADER_TEXTURE_3D);
    renderstate_set_mvp(rs, rs->mvp);

    uint_table_iterator iter = new_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        renderbuffer *b = pair.value;
        renderbuffer_zero(b);
    }

    float sine = sinf(-c->ry);
    float cosine = cosf(-c->ry);
    thing **things = w->things;
    int thing_count = w->thing_count;
    for (int i = 0; i < thing_count; i++) {
        thing_render(cache, things[i], sine, cosine);
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
    destroy_uint_table(self->cache);
}
