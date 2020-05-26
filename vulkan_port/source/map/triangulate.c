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
    p->last = create_array(0);
    p->next = create_array(0);
    return p;
}

static double calc_angle(vec *a, vec *b) {
    double angle = atan2(a->y - b->y, a->x - b->x);
    if (angle < 0) {
        angle += MATH_TAU;
    }
    return angle;
}

static double interior_angle(vec *a, vec *b, vec *c) {
    double angle_1 = atan2(a->y - b->y, a->x - b->x);
    double angle_2 = atan2(b->y - c->y, b->x - c->x);
    double interior = angle_2 - angle_1;
    if (interior < 0) {
        interior += MATH_TAU;
    }
    return interior;
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

    array *remaining = create_array_copy(points);

    while (array_not_empty(remaining)) {

        polygon_vertex *start = remaining->items[0];
        polygon_vertex *current = start;

        array *temp = create_array(0);
        array *dead = create_array(0);
        array *pending = create_array(0);

        do {
            current->perimeter = true;

            array_remove(remaining, current);

            while (array_size(current->next) != 1) {

                void *pv = current->next->items[1];
                if (!array_find(pending, find_address, pv)) {
                    array_push(pending, pv);
                }
                array_remove_index(current->next, 1);
            }

            while (array_size(current->last) != 1) {
                array_remove_index(current->last, 1);
            }

            current = current->next->items[0];

        } while (current != start);

        while (array_not_empty(pending)) {

            for (unsigned int i = 0; i < pending->length; i++) {
                polygon_vertex *pv = pending->items[i];
                array_push(dead, pv);

                for (unsigned int k = 0; k < pv->next->length; k++) {
                    polygon_vertex *n = pv->next->items[k];

                    if (!n->perimeter) {
                        if (!array_find(pending, find_address, n) && !array_find(temp, find_address, n) && !array_find(dead, find_address, n)) {
                            array_push(temp, n);
                        }
                    }
                }
            }

            array_clear(pending);

            for (unsigned int i = 0; i < temp->length; i++) {
                void *pv = temp->items[i];
                if (!array_find(pending, find_address, pv)) {
                    array_push(pending, pv);
                }
            }

            array_clear(temp);
        }

        for (unsigned int i = 0; i < dead->length; i++) {
            polygon_vertex *pv = dead->items[i];
            array_remove(remaining, pv);
            array_remove(points, pv);
        }
    }
}

static void populate_links(array *points, sector *sec, bool clockwise) {
    vec **vecs = sec->vecs;
    int vec_count = sec->vec_count;

    for (int i = 0; i < vec_count; i++) {
        polygon_vertex *original = array_find(points, find_vertex, vecs[i]);

        polygon_vertex *last = NULL;
        polygon_vertex *next = NULL;

        if (clockwise) {
            if (i == 0) {
                last = array_find(points, find_vertex, vecs[vec_count - 1]);
            } else {
                last = array_find(points, find_vertex, vecs[i - 1]);
            }

            if (i == vec_count - 1) {
                next = array_find(points, find_vertex, vecs[0]);
            } else {
                next = array_find(points, find_vertex, vecs[i + 1]);
            }

        } else {
            if (i == 0) {
                next = array_find(points, find_vertex, vecs[vec_count - 1]);
            } else {
                next = array_find(points, find_vertex, vecs[i - 1]);
            }

            if (i == vec_count - 1) {
                last = array_find(points, find_vertex, vecs[0]);
            } else {
                last = array_find(points, find_vertex, vecs[i + 1]);
            }
        }

        if (array_is_empty(original->last)) {
            array_push(original->last, last);
        } else {
            polygon_vertex *using_last = original->last->items[0];

            double angle = calc_angle(using_last->point, original->point);

            if (calc_angle(last->point, original->point) < angle) {
                array_insert(original->last, 0, last);
            }
        }

        if (array_is_empty(original->next)) {
            array_push(original->next, next);
        } else {
            polygon_vertex *using_next = original->next->items[0];

            double angle = calc_angle(using_next->point, original->point);

            if (calc_angle(next->point, original->point) < angle) {
                array_insert(original->next, 0, next);
            }
        }
    }
}

static void populate_with_vectors(array *points, sector *sec) {

    vec **vecs = sec->vecs;
    int vec_count = sec->vec_count;

    for (int i = 0; i < vec_count; i++) {
        vec *v = vecs[i];

        polygon_vertex *original = array_find(points, find_vertex, v);

        if (original == NULL) {
            polygon_vertex *vertex = polygon_vertex_init(v);
            array_insert_sort(points, compare_vertex, vertex);
        }
    }
}

static array *populate(sector *sec, bool floor) {

    array *points = create_array(0);

    sector **inside = sec->inside;
    int inside_count = sec->inside_count;

    for (int i = 0; i < inside_count; i++) {
        sector *inner = inside[i];
        if (floor) {
            if (sector_has_floor(inner) == false) {
                continue;
            }
        } else {
            if (sector_has_ceiling(inner) == false) {
                continue;
            }
        }

        populate_with_vectors(points, inner);
    }

    for (int i = 0; i < inside_count; i++) {
        sector *inner = inside[i];
        if (floor) {
            if (sector_has_floor(inner) == false) {
                continue;
            }
        } else {
            if (sector_has_ceiling(inner) == false) {
                continue;
            }
        }

        populate_links(points, inner, false);
    }

    clean_population(points);

    populate_with_vectors(points, sec);
    populate_links(points, sec, true);

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

static void clip(array *vecs, sector *sec, bool floor, array *triangles, float scale) {
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
                tri = create_triangle(sec->floor, sec->floor_texture, a, b, c, floor, scale);
            } else {
                vec a = vec_of(next);
                vec b = vec_of(pos);
                vec c = vec_of(last);
                tri = create_triangle(sec->ceiling, sec->ceiling_texture, a, b, c, floor, scale);
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
        tri = create_triangle(sec->floor, sec->floor_texture, a, b, c, floor, scale);
    } else {
        vec a = vec_of(vecs->items[2]);
        vec b = vec_of(vecs->items[1]);
        vec c = vec_of(vecs->items[0]);
        tri = create_triangle(sec->ceiling, sec->ceiling_texture, a, b, c, floor, scale);
    }
    array_push(triangles, tri);
}

static array *classify(array *points) {
    array *start = create_array(0);
    array *merge = create_array(0);
    array *split = create_array(0);

    for (unsigned int i = 0; i < points->length; i++) {
        polygon_vertex *pos = points->items[i];
        polygon_vertex *pre = pos->last->items[0];
        polygon_vertex *nex = pos->next->items[0];

        bool reflex = interior_angle(pre->point, pos->point, nex->point) > MATH_PI;
        bool both_above = pre->point->y < pos->point->y && nex->point->y <= pos->point->y;
        bool both_below = pre->point->y >= pos->point->y && nex->point->y >= pos->point->y;
        bool collinear = nex->point->y == pos->point->y;

        if (both_above && reflex) {
#ifdef TRIANGULATE_DEBUG
            printf("classify start: %f, %f\n", pos->point->x, pos->point->y);
#endif
            array_push(start, pos);
        } else if (both_above && !reflex) {
            if (!collinear) {
#ifdef TRIANGULATE_DEBUG
                printf("classify split: %f, %f\n", pos->point->x, pos->point->y);
#endif
                array_push(split, pos);
            }
        } else if (both_below && !reflex) {
            if (!collinear) {
#ifdef TRIANGULATE_DEBUG
                printf("classify merge: %f, %f\n", pos->point->x, pos->point->y);
#endif
                array_push(merge, pos);
            }
        }
    }

    for (unsigned int i = 0; i < merge->length; i++) {
        polygon_vertex *p = merge->items[i];

        unsigned int k;
        for (k = p->index + 1; k < points->length; k++) {
            polygon_vertex *diagonal = points->items[k];
            if (valid_polygon(points, p->point, diagonal->point)) {
                break;
            }
        }

        polygon_vertex *diagonal = points->items[k];

#ifdef TRIANGULATE_DEBUG
        printf("adding merge diangonal from (%f, %f) to (%f, %f)\n", p->point->x, p->point->y, diagonal->point->x, diagonal->point->y);
#endif

        p->merge = true;

        array_push(p->next, diagonal);
        array_push(p->last, diagonal);

        array_push(diagonal->next, p);
        array_push(diagonal->last, p);
    }

    for (unsigned int i = 0; i < split->length; i++) {
        polygon_vertex *p = split->items[i];

        int k;
        for (k = p->index - 1; k >= 0; k--) {
            polygon_vertex *diagonal = points->items[k];
            if (valid_polygon(points, p->point, diagonal->point)) {
                break;
            }
        }

        polygon_vertex *diagonal = points->items[k];

        if (diagonal->merge) {
#ifdef TRIANGULATE_DEBUG
            printf("split using same diagonal as merge (%f, %f) to (%f, %f)\n", p->point->x, p->point->y, diagonal->point->x, diagonal->point->y);
#endif
            continue;
        }

#ifdef TRIANGULATE_DEBUG
        printf("adding split diagonal from (%f, %f) to (%f, %f)\n", p->point->x, p->point->y, diagonal->point->x, diagonal->point->y);
#endif

        array_push(start, diagonal);

        array_push(p->next, diagonal);
        array_push(p->last, diagonal);

        array_push(diagonal->next, p);
        array_push(diagonal->last, p);
    }

    delete_array(merge);
    delete_array(split);

    return start;
}

static void iterate_clip(array *monotone, sector *sec, bool floor, array *triangles, float scale) {
    for (unsigned int i = 0; i < monotone->length; i++) {
        array *vecs = create_array(0);
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
                // double interior = interior_angle(a, b, c);
                // why atan2(x, y) not atan2(y, x)

                double angle1 = atan2(a->x - b->x, a->y - b->y);
                double angle2 = atan2(b->x - c->x, b->y - c->y);

                double interior = angle2 - angle1;

                if (interior < 0) {
                    interior += MATH_PI * 2;
                }
                //

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

        clip(vecs, sec, floor, triangles, scale);
    }
}

static void build(sector *sec, bool floor, array *triangles, float scale) {
    if (floor) {
        if (sector_has_floor(sec) == false) {
            return;
        }
    } else {
        if (sector_has_ceiling(sec) == false) {
            return;
        }
    }

    array *points = populate(sec, floor);

#ifdef TRIANGULATE_DEBUG
    printf("points:\n");
    for (unsigned int i = 0; i < points->length; i++) {
        polygon_vertex *vert = points->items[i];
        printf("  (%d) %f, %f\n", vert->index, vert->point->x, vert->point->y);
    }
#endif

    array *monotone = classify(points);

#ifdef TRIANGULATE_DEBUG
    printf("monotone count %d\n", array_size(monotone));
#endif

    iterate_clip(monotone, sec, floor, triangles, scale);

#ifdef TRIANGULATE_DEBUG
    printf("triangle count %d\n", array_size(triangles));
#endif

    delete_array(points);
    delete_array(monotone);
}

void triangulate_sector(sector *sec, float scale) {
    array *ls = create_array(0);
    build(sec, true, ls, scale);
    build(sec, false, ls, scale);
    sec->triangles = (triangle **)array_copy_items(ls);
    sec->triangle_count = ls->length;
    delete_array(ls);
}
