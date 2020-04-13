#include "triangulate.h"

typedef struct triangle_list triangle_list;

struct triangle_list {
    triangle *item;
    triangle_list *next;
};

typedef struct polygon_vertex polygon_vertex;

struct polygon_vertex {
    int index;
    bool merge;
    bool perimeter;
    polygon_vertex *previous;
    polygon_vertex *next;
    vec *point;
};

static polygon_vertex *polygon_vertex_init(vec *v) {
    polygon_vertex *p = safe_calloc(1, sizeof(polygon_vertex));
    p->point = v;
    return p;
}

static int triangle_list_size(triangle_list *list) {
    if (list->item == NULL) {
        return 0;
    }
    int size = 0;
    while (list) {
        size++;
        list = list->next;
    }
    printf("triangle list size %d\n", size);
    return size;
}

typedef struct polygon_vertex_list polygon_vertex_list;

struct polygon_vertex_list {
    polygon_vertex *item;
    polygon_vertex_list *next;
};

static int polygon_vertex_list_size(polygon_vertex_list *list) {
    if (list->item == NULL) {
        return 0;
    }
    int size = 0;
    while (list) {
        size++;
        list = list->next;
    }
    return size;
}

static polygon_vertex *find_vertex(polygon_vertex_list *points, vec *v) {
    if (points->item != NULL) {
        while (points) {
            vec *original = points->item->point;
            if (original->x == v->x && v->y == original->y) {
                return points->item;
            }
            points = points->next;
        }
    }
    return NULL;
}

static void clean_population(polygon_vertex_list *points) {
    printf("clean_population %p\n", (void *)points);
}

static void populate_links(polygon_vertex_list *points, sector *s, bool clockwise) {
    printf("populate_links %p %p %s\n", (void *)points, (void *)s, clockwise ? "true" : "false");
}

static void populate_with_vectors(polygon_vertex_list *points, sector *s) {

    int vec_count = s->vec_count;
    vec **vecs = s->vecs;

    for (int i = 0; i < vec_count; i++) {
        vec *v = vecs[i];

        polygon_vertex *original = find_vertex(points, v);

        if (original == NULL) {

            polygon_vertex *vertex = polygon_vertex_init(v);

            polygon_vertex_list *node = points;
            if (node->item == NULL) {
                node->item = vertex;
            } else {
                polygon_vertex_list *previous = NULL;
                while (node) {
                    polygon_vertex *current = node->item;
                    if (v->y < current->point->y || (v->y == current->point->y && v->x > current->point->x)) {
                        previous = node;
                        node = node->next;
                        continue;
                    }
                    break;
                }

                polygon_vertex_list *link = safe_calloc(1, sizeof(polygon_vertex_list));
                link->item = vertex;

                if (node == NULL) {
                    link->next = previous->next;
                    previous->next = link;
                } else {
                    link->next = node->next;
                    node->next = link;
                }
            }
        }
    }
}

static polygon_vertex_list *populate(sector *s, bool floor) {
    polygon_vertex_list *points = safe_calloc(1, sizeof(polygon_vertex_list));

#ifdef DEBUG_TRIANGULATE
    printf("populate\n");
#endif

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

    polygon_vertex_list *node = points;
    if (node->item != NULL) {
        int i = 0;
        while (node) {
            node->item->index = i;
            node = node->next;
            i++;
        }
    }

    return points;
}

static void clip() {
    printf("clip!\n");
}

static void classify(polygon_vertex_list *points) {
    printf("classify %p\n", (void *)points);
}

static void make(sector *s, bool floor, triangle_list *list, float scale) {
    if (floor) {
        if (s->floor_texture == -1) {
            return;
        }
    } else {
        if (s->ceil_texture == -1) {
            return;
        }
    }

    polygon_vertex_list *points = populate(s, floor);

#ifdef DEBUG_TRIANGULATE
    printf("point size %d\n", polygon_vertex_list_size(points));
#endif

    polygon_vertex_list *monotone = classify(points);

#ifdef DEBUG_TRIANGULATE
    printf("monotone size %p\n", (void *)monotone);
#endif

#ifdef DEBUG_TRIANGULATE
    printf("make %p %p scale %f point size %d\n", (void *)points, (void *)list, scale);
#endif
}

void triangulate_sector(sector *s, float scale) {
    triangle_list *list = safe_calloc(1, sizeof(triangle_list));
    make(s, true, list, scale);
    make(s, false, list, scale);
    int size = triangle_list_size(list);
    s->triangles = safe_malloc(size * sizeof(triangle *));
    triangle_list *node = list;
    for (int i = 0; i < size; i++) {
        s->triangles[i] = node->item;
        triangle_list *next = node->next;
        free(node);
        node = next;
    }
}
