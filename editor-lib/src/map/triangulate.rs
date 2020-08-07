use crate::map::sector::Sector;
use crate::map::triangle::Triangle;
use crate::math::util::float_eq;
use crate::math::vector::Vector2;

use std::cell::RefCell;
use std::collections::HashMap;
use std::collections::HashSet;
use std::rc::Rc;
use std::rc::Weak;

struct Polygon {
    index: usize,
    merge: bool,
    perimeter: bool,
    point: Vector2,
    previous: Vec<Vector2>,
    next: Vec<Vector2>,
}

impl Polygon {
    fn new(point: Vector2) -> Self {
        Polygon {
            index: 0,
            merge: false,
            perimeter: false,
            previous: Vec::new(),
            next: Vec::new(),
            point,
        }
    }
}

fn update_polygon_indices(polygons: &Vec<Rc<RefCell<Polygon>>>) {
    for (i, polygon) in polygons.iter().enumerate() {
        polygon.borrow_mut().index = i
    }
}

fn polygon_vec_equal(polygon: &Polygon, point: Vector2) -> bool {
    float_eq(polygon.point.x, point.x) && float_eq(polygon.point.y, point.y)
}

fn polygon_find(
    polygons: &Vec<Rc<RefCell<Polygon>>>,
    point: Vector2,
) -> Option<Rc<RefCell<Polygon>>> {
    for poly in polygons.iter() {
        if polygon_vec_equal(&poly.borrow(), point) {
            return Some(poly.clone());
        }
    }
    return Option::None;
}

fn polygon_index_of_vec(polygons: &Vec<Rc<RefCell<Polygon>>>, point: Vector2) -> usize {
    let p = polygon_find(polygons, point).unwrap();
    let i = p.borrow().index;
    i
}

fn polygon_compare(a: &Polygon, b: &Polygon) -> i32 {
    let i = a.point;
    let e = b.point;
    if i.y < e.y || (float_eq(i.y, e.y) && i.x > e.x) {
        return 1;
    }
    return -1;
}

fn triangle_contains(tri: [Vector2; 3], x: f32, y: f32) -> bool {
    let mut odd = false;
    let mut k = 2;
    for i in 0..3 {
        let vi = tri[i];
        let vi = tri[k];
        let value = 0.0;
        if x < value {
            odd = !odd;
        }
        k = i;
    }
    odd
}

fn polygon_sorted_insert(polygons: &mut Vec<Rc<RefCell<Polygon>>>, point: Vector2) {
    let polygon = Polygon::new(point);
    for (i, existing) in polygons.iter().enumerate() {
        if polygon_compare(&polygon, &existing.borrow()) <= 0 {
            polygons.insert(i, Rc::new(RefCell::new(polygon)));
            return;
        }
    }
    polygons.push(Rc::new(RefCell::new(polygon)));
}

fn cull_vectors(polygons: &mut Vec<Rc<RefCell<Polygon>>>) {
    update_polygon_indices(polygons);
    let mut cull = Vec::new();
    let mut remaining = Vec::with_capacity(polygons.len());
    for polygon in polygons.iter() {
        remaining.push(polygon.borrow().index);
    }
    let mut dead = HashSet::new();
    let mut holding = HashSet::new();
    let mut pending = HashSet::new();
    while remaining.len() > 0 {
        let start = remaining[0];
        let mut current = start;
        loop {
            let mut polygon = polygons[current].borrow_mut();
            polygon.perimeter = true;
            remaining.remove(current);
            while polygon.next.len() != 1 {
                let next = polygon_index_of_vec(polygons, polygon.next[1]);
                pending.insert(next);
                polygon.next.remove(1);
            }
            while polygon.previous.len() != 1 {
                polygon.previous.remove(1);
            }
            current = polygon_index_of_vec(polygons, polygon.next[0]);
            if current == start {
                break;
            }
        }
        while pending.len() > 0 {
            for polygon_index in pending.iter().copied() {
                dead.insert(polygon_index);
                let polygon = polygons[polygon_index].borrow();
                for point in polygon.next.iter().copied() {
                    let find = polygon_find(polygons, point).unwrap();
                    let next = find.borrow();
                    if !next.perimeter {
                        if !pending.contains(&next.index) && !dead.contains(&next.index) {
                            holding.insert(next.index);
                        }
                    }
                }
            }
            pending.clear();
            for polygon_index in holding.iter().copied() {
                pending.insert(polygon_index);
            }
            holding.clear();
        }
        for polygon_index in dead.iter().copied() {
            for x in 0..remaining.len() {
                if remaining[x] == polygon_index {
                    remaining.remove(x);
                    break;
                }
            }
            cull.push(polygon_index);
        }
        dead.clear();
        holding.clear();
        pending.clear();
    }
    for polygon_index in cull.iter().copied() {
        for x in 0..polygons.len() {
            if polygons[x].borrow().index == polygon_index {
                polygons.remove(x);
                break;
            }
        }
    }
}

fn populate_references(sec: &Sector, polygons: &Vec<Rc<RefCell<Polygon>>>, clockwise: bool) {
    let len: usize = sec.vecs.len();
    for i in 0..len {
        let find = polygon_find(polygons, sec.vecs[i]).unwrap();
        let mut original = find.borrow_mut();
        let mut p = i - 1;
        let mut n = i + 1;
        if i == 0 {
            p = len - 1;
        } else if i == len - 1 {
            n = 0;
        }
        if !clockwise {
            let t = p;
            p = n;
            n = t;
        }
        let next = polygon_find(polygons, sec.vecs[n]).unwrap().borrow().point;
        let previous = polygon_find(polygons, sec.vecs[p]).unwrap().borrow().point;
        if original.previous.is_empty() {
            original.previous.push(previous);
        } else {
            let point = original.point;
            let existing = original.previous[0];
            if previous.angle(point) < existing.angle(point) {
                original.previous.insert(0, previous);
            }
        }
        if original.next.is_empty() {
            original.next.push(next);
        } else {
            let point = original.point;
            let existing = original.next[0];
            if next.angle(point) < existing.angle(point) {
                original.next.insert(0, next);
            }
        }
    }
}

fn populate_vectors(sec: &Sector, polygons: &mut Vec<Rc<RefCell<Polygon>>>) {
    for point in sec.vecs.iter().copied() {
        let mut exists = false;
        for polygon in polygons.iter() {
            if polygon_vec_equal(&polygon.borrow(), point) {
                exists = true;
                break;
            }
        }
        if !exists {
            polygon_sorted_insert(polygons, point);
        }
    }
}

fn skip(sector: &Sector, floor: bool) -> bool {
    if floor {
        if !sector.has_floor() {
            return true;
        }
    }
    !sector.has_ceiling()
}

fn populate(sec: &Sector, floor: bool, mut polygons: &mut Vec<Rc<RefCell<Polygon>>>) {
    for inner in sec.inside.iter() {
        if skip(inner, floor) {
            continue;
        }
        populate_vectors(inner, &mut polygons);
    }
    for inner in sec.inside.iter() {
        if skip(inner, floor) {
            continue;
        }
        populate_references(inner, &polygons, false);
    }
    cull_vectors(&mut polygons);
    populate_vectors(sec, &mut polygons);
    populate_references(sec, &polygons, true);
    update_polygon_indices(&polygons);
}

fn classify(polygons: &Vec<Rc<RefCell<Polygon>>>, monotone: &mut Vec<Rc<RefCell<Polygon>>>) {}

fn clip(
    sec: &Sector,
    floor: bool,
    scale: f32,
    monotone: &Vec<Rc<RefCell<Polygon>>>,
    triangles: &mut Vec<Triangle>,
) {
}

fn construct(sector: &Sector, floor: bool, scale: f32, triangles: &mut Vec<Triangle>) {
    if skip(sector, floor) {
        return;
    }
    let mut polygons = Vec::new();
    let mut monotone = Vec::new();
    populate(sector, floor, &mut polygons);
    classify(&polygons, &mut monotone);
    clip(sector, floor, scale, &monotone, triangles);
}

pub fn triangulate_sector(sec: &mut Sector, scale: f32) {
    let mut triangles: Vec<Triangle> = Vec::new();
    construct(sec, true, scale, &mut triangles);
    construct(sec, false, scale, &mut triangles);
    sec.update_triangles(triangles);
}
