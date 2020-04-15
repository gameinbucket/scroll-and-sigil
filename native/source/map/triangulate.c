#include "triangulate.h"

typedef struct polygon_vertex polygon_vertex;

struct polygon_vertex {
    int index;
    bool merge;
    bool perimeter;
    array *last;
    array *next;
    vec *point;
};

static polygon_vertex *polygon_vertex_init(vec *v) {
    polygon_vertex *p = safe_calloc(1, sizeof(polygon_vertex));
    p->point = v;
    p->last = array_init(0);
    p->next = array_init(0);
    return p;
}

static bool find_vertex(void *item, void *has) {
    vec *original = ((polygon_vertex *)item)->point;
    vec *v = has;
    return (original->x == v->x) && (v->y == original->y);
}

static int compare_vertex(void *item, void *existing) {
    vec *i = ((polygon_vertex *)item)->point;
    vec *e = ((polygon_vertex *)existing)->point;
    if (i->y < e->y || (i->y == e->y && i->x > e->x)) {
        return 1;
    }
    return -1;
}

static void clean_population(array *points) {
    int size = points->length;
    array *remaining = array_init(size);

    while (remaining->length > 0) {

        polygon_vertex *start = remaining->items[0];
        polygon_vertex *current = start;

        array *todo = array_init(0);
        array *temp = array_init(0);
        array *dead = array_init(0);

        do {
            current->perimeter = true;

            array_remove(remaining, current);

            while (array_size(current->next) != 1) {
                array_push(todo, current->next->items[1]);
                array_remove_index(current->next, 1);
            }

            while (array_size(current->last) != 1) {
                array_remove_index(current->last, 1);
            }

            current = current->next->items[0];

        } while (current != start);

        while (todo->length > 0) {

            for (unsigned int i = 0; i < temp->length; i++) {
                array_push(todo, temp->items[i]);
            }

            array_clear(temp);
        }

        for (unsigned int i = 0; i < dead->length; i++) {
            polygon_vertex *p = dead->items[i];
            array_remove(remaining, p);
            array_remove(points, p);
        }
    }
}

static void populate_links(array *points, sector *s, bool clockwise) {
    vec **vecs = s->vecs;
    int vec_count = s->vec_count;

    for (int i = 0; i < vec_count; i++) {
        polygon_vertex *original = array_find(points, find_vertex, vecs[i]);
        }
}

static void populate_with_vectors(array *points, sector *s) {

    int vec_count = s->vec_count;
    vec **vecs = s->vecs;

    for (int i = 0; i < vec_count; i++) {
        vec *v = vecs[i];

        polygon_vertex *original = array_find(points, find_vertex, v);

        if (original == NULL) {
            polygon_vertex *vertex = polygon_vertex_init(v);
            array_insert_sort(points, compare_vertex, vertex);
        }
    }
}

static array *populate(sector *s, bool floor) {
    array *points = array_init(0);

    printf("populate\n");

    int inside_count = s->inside_count;
    sector **inside = s->inside;

    for (int i = 0; i < inside_count; i++) {
        sector *inner = inside[i];
        if (floor) {
            if (!inner->has_floor) {
                continue;
            }
        } else {
            if (!inner->has_ceil) {
                continue;
            }
        }

        populate_with_vectors(points, inner);
    }

    clean_population(points);

    populate_with_vectors(points, s);
    populate_links(points, s, true);

    for (unsigned int i = 0; i < points->length; i++) {
        ((polygon_vertex *)points->items[i])->index = i;
    }

    return points;
}

static bool triangle_contains(vec **tri, float x, float y) {
    bool odd = false;
    int j = 2;
    for (int i = 0; i < 3; i++) {
        vec *vi = tri[i];
        vec *vj = tri[j];

        if ((vi->y > y) != (vj->y > y)) {
            float value = (vj->x - vi->x) * (y - vi->y) / (vj->y - vi->y) + vi->x;
            if (x < value) {
                odd = !odd;
            }
        }

        j = i;
    }
    return odd;
}

static double interior_angle(vec *a, vec *b, vec *c) {
    double angle_1 = atan2(a->x - b->x, a->y - b->y);
    double angle_2 = atan2(b->x - c->x, b->y - c->y);
    double interior = angle_2 - angle_1;
    if (interior < 0) {
        interior += MATH_TAU;
    }
    return interior;
}

static bool valid_polygon(array *poly_vertices, vec *a, vec *b) {

    for (unsigned int i = 0; i < poly_vertices->length; i++) {
        polygon_vertex *p = poly_vertices->items[i];

        vec *c = p->point;
        vec *d = ((polygon_vertex *)p->last->items[0])->point;

        if (a != c && a != d && b != c && b != d && vec_intersect(a, b, c, d)) {
            return false;
        }
    }

    return true;
}

static bool valid(array *vecs, vec *a, vec *b, vec *c) {

    if (interior_angle(a, b, c) > MATH_PI) {
        return false;
    }

    vec *tri[3] = {a, b, c};

    for (unsigned int i = 0; i < vecs->length; i++) {
        vec *p = vecs->items[i];
        if (p == a || p == b || p == c) {
            continue;
        }
        if (triangle_contains(tri, p->x, p->y)) {
            return false;
        }
    }

    return true;
}

static void clip(array *vecs, sector *s, bool floor, array *triangles, float scale) {
    unsigned int i = 0;
    unsigned int size = vecs->length;
    while (size > 3) {

        int minus = i - 1;
        if (minus == -1) {
            minus += size;
        }

        vec *last = vecs->items[minus];
        vec *pos = vecs->items[i];
        vec *next = vecs->items[(i + 1) % size];

        if (valid(vecs, last, pos, next)) {

            triangle *tri;
            if (floor) {
                vec a = vec_of(last);
                vec b = vec_of(pos);
                vec c = vec_of(next);
                tri = triangle_init(s->floor, s->floor_texture, a, b, c, floor, scale);
            } else {
                vec a = vec_of(next);
                vec b = vec_of(pos);
                vec c = vec_of(last);
                tri = triangle_init(s->ceil, s->ceil_texture, a, b, c, floor, scale);
            }

            array_push(triangles, tri);

            array_remove_index(vecs, i);
            size--;

        } else {
            i++;
        }

        if (i == size) {
            i = 0;
        }
    }

    triangle *tri;
    if (floor) {
        vec a = vec_of(vecs->items[0]);
        vec b = vec_of(vecs->items[1]);
        vec c = vec_of(vecs->items[2]);
        tri = triangle_init(s->floor, s->floor_texture, a, b, c, floor, scale);
    } else {
        vec a = vec_of(vecs->items[2]);
        vec b = vec_of(vecs->items[1]);
        vec c = vec_of(vecs->items[0]);
        tri = triangle_init(s->ceil, s->ceil_texture, a, b, c, floor, scale);
    }
    array_push(triangles, tri);
}

static array *classify(array *points) {
    array *start = array_init(0);
    array *merge = array_init(0);
    array *split = array_init(0);

    for (unsigned int i = 0; i < points->length; i++) {
        polygon_vertex *pos = points->items[i];
        polygon_vertex *pre = pos->last->items[0];
        polygon_vertex *nex = pos->next->items[0];

        bool reflex = interior_angle(pre->point, pos->point, nex->point) > MATH_PI;
        bool both_above = pre->point->y < pos->point->y && nex->point->y <= pos->point->y;
        bool both_below = pre->point->y >= pos->point->y && nex->point->y >= pos->point->y;
        bool collinear = nex->point->y == pos->point->y;

        if (both_above && reflex) {
            array_push(start, pos);
        } else if (both_above && !reflex) {
            if (!collinear) {
                array_push(split, pos);
            }
        } else if (both_below && !reflex) {
            if (!collinear) {
                array_push(merge, pos);
            }
        }
    }

    for (unsigned int i = 0; i < merge->length; i++) {
        polygon_vertex *p = merge->items[i];

        unsigned int j;
        for (j = p->index + 1; j < points->length; j++) {
            polygon_vertex *diagonal = points->items[j];
            if (valid_polygon(points, p->point, diagonal->point)) {
                break;
            }
        }

        polygon_vertex *diagonal = points->items[j];

        p->merge = true;

        array_push(p->next, diagonal);
        array_push(p->last, diagonal);

        array_push(diagonal->next, p);
        array_push(diagonal->last, p);
    }

    for (unsigned int i = 0; i < split->length; i++) {
        polygon_vertex *p = split->items[i];

        int j = p->index - 1;
        for (j = p->index - 1; j >= 0; j--) {
            polygon_vertex *diagonal = points->items[j];
            if (valid_polygon(points, p->point, diagonal->point)) {
                break;
            }
        }

        polygon_vertex *diagonal = points->items[j];

        if (diagonal->merge) {
            continue;
        }

        array_push(start, diagonal);

        array_push(p->next, diagonal);
        array_push(p->last, diagonal);

        array_push(diagonal->next, p);
        array_push(diagonal->last, p);
    }

    array_free(merge);
    array_free(split);

    return start;
}

static void iterate_clip(array *monotone, sector *s, bool floor, array *triangles, float scale) {
    for (unsigned int i = 0; i < monotone->length; i++) {
        array *vecs = array_init(0);
        polygon_vertex *ini = monotone->items[i];
        polygon_vertex *nex = ini->next->items[0];
        polygon_vertex *pos = ini;
        do {
            array_push(vecs, vec_copy(pos->point));
            polygon_vertex *pre = NULL;
            double angle = DBL_MAX;
            for (unsigned int j = 0; j < pos->last->length; j++) {
                polygon_vertex *test = pos->last->items[j];
                vec *a = nex->point;
                vec *b = pos->point;
                vec *c = test->point;
                double interior = interior_angle(a, b, c);
                interior += MATH_PI;
                if (interior > MATH_TAU) {
                    interior -= MATH_TAU;
                }
                if (interior < angle) {
                    pre = test;
                    angle = interior;
                }
            }

            array_remove(pos->next, nex);
            array_remove(pos->last, pre);

            nex = pos;
            pos = pre;

        } while (pos != ini);

        clip(vecs, s, floor, triangles, scale);
    }
}

static void build(sector *s, bool floor, array *triangles, float scale) {
    if (floor) {
        if (s->floor_texture == -1) {
            return;
        }
    } else {
        if (s->ceil_texture == -1) {
            return;
        }
    }

    array *points = populate(s, floor);

    printf("point count %d\n", array_size(points));

    array *monotone = classify(points);

    printf("monotone count %d\n", array_size(monotone));

    iterate_clip(monotone, s, floor, triangles, scale);

    printf("triangle count %d\n", array_size(triangles));

    array_free(points);
    array_free(monotone);
}

void triangulate_sector(sector *s, float scale) {
    array *ls = array_init(0);
    build(s, true, ls, scale);
    build(s, false, ls, scale);
    s->triangles = (triangle **)array_copy(ls);
    s->triangle_count = ls->length;
    array_free(ls);
}
