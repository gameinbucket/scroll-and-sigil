#include "triangulate.h"

typedef struct polygon_vertex polygon_vertex;

struct polygon_vertex {
    int index;
    bool merge;
    bool perimeter;
    list *last;
    list *next;
    vec *point;
};

static polygon_vertex *polygon_vertex_init(vec *v) {
    polygon_vertex *p = safe_calloc(1, sizeof(polygon_vertex));
    p->point = v;
    p->last = list_init();
    p->next = list_init();
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

            while (list_size(current->next) != 1) {
                array_push(todo, list_get(current->next, 1));
                list_remove_index(current->next, 1);
            }

            while (list_size(current->last) != 1) {
                list_remove_index(current->last, 1);
            }

            current = current->next->item;

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

static void populate_links(list *points, sector *s, bool clockwise) {
    printf("populate_links %p %p %s\n", (void *)points, (void *)s, clockwise ? "true" : "false");
}

static void populate_with_vectors(list *points, sector *s) {

    int vec_count = s->vec_count;
    vec **vecs = s->vecs;

    for (int i = 0; i < vec_count; i++) {
        vec *v = vecs[i];

        polygon_vertex *original = list_find(points, find_vertex, v);

        if (original == NULL) {
            polygon_vertex *vertex = polygon_vertex_init(v);
            list_insert_sort(points, compare_vertex, vertex);
        }
    }
}

static list *populate(sector *s, bool floor) {
    list *points = list_init();

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

    list *node = points;
    if (node->item != NULL) {
        int i = 0;
        while (node) {
            ((polygon_vertex *)node->item)->index = i;
            node = node->next;
            i++;
        }
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

static bool valid_polygon(list *poly_vertices, vec *a, vec *b) {

    list *node = poly_vertices;
    do {
        polygon_vertex *p = node->item;

        vec *c = p->point;
        vec *d = ((polygon_vertex *)p->last->item)->point;

        if (a != c && a != d && b != c && b != d && vec_intersect(a, b, c, d)) {
            return false;
        }

        node = node->next;
    } while (node);

    return true;
}

static bool valid(list *vecs, vec *a, vec *b, vec *c) {

    if (interior_angle(a, b, c) > MATH_PI) {
        return false;
    }

    vec *tri[3] = {a, b, c};

    list *node = vecs;
    do {
        vec *p = node->item;
        if (p == a || p == b || p == c) {
            continue;
        }
        if (triangle_contains(tri, p->x, p->y)) {
            return false;
        }
        node = node->next;
    } while (node);

    return true;
}

static void clip(list *vecs, sector *s, bool floor, list *triangles, float scale) {
    unsigned int i = 0;
    unsigned int size = list_size(vecs);
    while (size > 3) {

        int minus = i - 1;
        if (minus == -1) {
            minus += size;
        }
        vec *last = list_get(vecs, minus);
        vec *pos = list_get(vecs, i);
        vec *next = list_get(vecs, (i + 1) % size);

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
            list_push(triangles, tri);

            list_remove_index(vecs, i);
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
        vec a = vec_of(list_get(vecs, 0));
        vec b = vec_of(list_get(vecs, 1));
        vec c = vec_of(list_get(vecs, 2));
        tri = triangle_init(s->floor, s->floor_texture, a, b, c, floor, scale);
    } else {
        vec a = vec_of(list_get(vecs, 2));
        vec b = vec_of(list_get(vecs, 1));
        vec c = vec_of(list_get(vecs, 0));
        tri = triangle_init(s->ceil, s->ceil_texture, a, b, c, floor, scale);
    }
    list_push(triangles, tri);
}

static list *classify(list *points) {
    list *start = list_init();
    list *merge = list_init();
    list *split = list_init();

    list *node = points;
    do {
        polygon_vertex *pos = node->item;
        polygon_vertex *pre = pos->last->item;
        polygon_vertex *nex = pos->next->item;

        bool reflex = interior_angle(pre->point, pos->point, nex->point) > MATH_PI;
        bool both_above = pre->point->y < pos->point->y && nex->point->y <= pos->point->y;
        bool both_below = pre->point->y >= pos->point->y && nex->point->y >= pos->point->y;
        bool collinear = nex->point->y == pos->point->y;

        if (both_above && reflex) {
            list_push(start, pos);
        } else if (both_above && !reflex) {
            if (!collinear) {
                list_push(split, pos);
            }
        } else if (both_below && !reflex) {
            if (!collinear) {
                list_push(merge, pos);
            }
        }

    } while (node);

    node = merge;
    do {
        polygon_vertex *p = node->item;

        int j;
        int size = list_size(points);
        for (j = p->index + 1; j < size; j++) {
            polygon_vertex *diagonal = list_get(points, j);
            if (valid_polygon(points, p->point, diagonal->point)) {
                break;
            }
        }

        polygon_vertex *diagonal = list_get(points, j);

        p->merge = true;

        list_push(p->next, diagonal);
        list_push(p->last, diagonal);

        list_push(diagonal->next, p);
        list_push(diagonal->last, p);

    } while (node);

    node = split;
    do {
        polygon_vertex *p = node->item;

        int j;
        for (j = p->index - 1; j > -1; j--) {
            polygon_vertex *diagonal = list_get(points, j);
            if (valid_polygon(points, p->point, diagonal->point)) {
                break;
            }
        }

        polygon_vertex *diagonal = list_get(points, j);

        if (diagonal->merge) {
            continue;
        }

        list_push(start, diagonal);

        list_push(p->next, diagonal);
        list_push(p->last, diagonal);

        list_push(diagonal->next, p);
        list_push(diagonal->last, p);

    } while (node);

    list_free(merge);
    list_free(split);

    return start;
}

static void mono(list *monotone, sector *s, bool floor, list *triangles, float scale) {
    list *node = monotone;
    if (node->item == NULL) {
        return;
    }
    while (node) {
        list *vecs = list_init();
        polygon_vertex *ini = node->item;
        polygon_vertex *nex = ini->next->item;
        polygon_vertex *pos = ini;
        do {
            list_push(vecs, vec_copy(pos->point));
            polygon_vertex *pre = NULL;
            double angle = DBL_MAX;
            list *last = pos->last;
            if (list_not_empty(last)) {
                while (last) {
                    polygon_vertex *test = last->item;
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
                    last = last->next;
                }
            }

            list_remove(pos->next, nex);
            list_remove(pos->last, pre);

            nex = pos;
            pos = pre;

        } while (pos != ini);

        clip(vecs, s, floor, triangles, scale);

        node = node->next;
    }
}

static void build(sector *s, bool floor, list *triangles, float scale) {
    if (floor) {
        if (s->floor_texture == -1) {
            return;
        }
    } else {
        if (s->ceil_texture == -1) {
            return;
        }
    }

    list *points = populate(s, floor);

    printf("point count %d\n", list_size(points));

    list *monotone = classify(points);

    printf("monotone count %d\n", list_size(monotone));

    mono(monotone, s, floor, triangles, scale);

    printf("triangle count %d\n", list_size(triangles));

    list_free(points);
    list_free(monotone);
}

void triangulate_sector(sector *s, float scale) {
    list *ls = list_init();
    build(s, true, ls, scale);
    build(s, false, ls, scale);
    s->triangles = (triangle **)list_to_array(ls);
    list_free(ls);
}
