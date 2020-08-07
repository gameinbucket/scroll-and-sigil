use crate::map::sector::Sector;
use crate::map::triangle::Triangle;
use crate::math::util::float_eq;
use crate::math::util::float_zero;
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

fn polygon_find(
    polygons: &Vec<Rc<RefCell<Polygon>>>,
    point: Vector2,
) -> Option<Rc<RefCell<Polygon>>> {
    for polygon in polygons.iter() {
        if point.eq(polygon.borrow().point) {
            return Some(polygon.clone());
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
        let vk = tri[k];
        if (vi.y > y) != (vk.y > y) {
            let value = (vk.x - vi.x) * (y - vi.y) / (vk.y - vi.y) + vi.x;
            if x < value {
                odd = !odd;
            }
        }
        k = i;
    }
    odd
}

fn vector_line_intersect(a: Vector2, b: Vector2, c: Vector2, d: Vector2) -> bool {
    let a1: f32 = b.y - a.y;
    let b1: f32 = a.x - b.x;
    let c1: f32 = (b.x * a.y) - (a.x * b.y);
    let r3: f32 = (a1 * c.x) + (b1 * c.y) + c1;
    let r4: f32 = (a1 * d.x) + (b1 * d.y) + c1;
    if !float_zero(r3) && !float_zero(r4) && r3 * r4 >= 0.0 {
        return false;
    }
    let a2: f32 = d.y - c.y;
    let b2: f32 = c.x - d.x;
    let c2: f32 = (d.x * c.y) - (c.x * d.y);
    let r1: f32 = (a2 * a.x) + (b2 * a.y) + c2;
    let r2: f32 = (a2 * b.x) + (b2 * b.y) + c2;
    if !float_zero(r1) && !float_zero(r2) && r1 * r2 >= 0.0 {
        return false;
    }
    let denominator: f32 = (a1 * b2) - (a2 * b1);
    if (float_zero(denominator)) {
        return false;
    }
    true
}

fn valid_polygon(polygon: &Vec<Rc<RefCell<Polygon>>>, a: Vector2, b: Vector2) -> bool {
    for polygon in polygon.iter() {
        let c = polygon.borrow().point;
        let d = polygon.borrow().previous[0];
        if !a.eq(c) && !a.eq(d) && !b.eq(c) && !b.eq(d) && vector_line_intersect(a, b, c, d) {
            return false;
        }
    }
    true
}

fn valid_vectors(vectors: &Vec<Vector2>, a: Vector2, b: Vector2, c: Vector2) -> bool {
    if a.interior_angle(b, c) > std::f32::consts::PI {
        return false;
    }
    let tri = [a, b, c];
    for vec in vectors.iter().copied() {
        if vec.eq(a) || vec.eq(b) || vec.eq(c) {
            continue;
        }
        if triangle_contains(tri, vec.x, vec.y) {
            return false;
        }
    }
    true
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
            if point.eq(polygon.borrow().point) {
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

fn classify(polygons: &Vec<Rc<RefCell<Polygon>>>, monotone: &mut Vec<Rc<RefCell<Polygon>>>) {
    let mut merge = Vec::new();
    let mut split = Vec::new();
    for polygon in polygons.iter() {
        let current = polygon.borrow();
        let previous = current.previous[0];
        let next = current.next[0];
        let reflex = previous.interior_angle(current.point, next) > std::f32::consts::PI;
        let both_above = previous.y < current.point.y && next.y <= current.point.y;
        let both_below = previous.y >= current.point.y && next.y >= current.point.y;
        let collinear = next.y == current.point.y;
        if (both_above && reflex) {
            monotone.push(polygon.clone());
        } else if (both_above && !reflex) {
            if (!collinear) {
                split.push(polygon);
            }
        } else if (both_below && !reflex) {
            if (!collinear) {
                merge.push(polygon.clone());
            }
        }
    }
    for polygon in merge.iter() {
        let current = polygon.borrow();
        let start = current.index + 1;
        let point = current.point;
        for k in start..polygons.len() {
            let diagonal = polygons[k].borrow();
            if valid_polygon(polygons, point, diagonal.point) {
                let mut current = polygon.borrow_mut();
                let mut diagonal = polygons[k].borrow_mut();
                current.merge = true;
                current.next.push(diagonal.point);
                current.previous.push(diagonal.point);
                diagonal.next.push(current.point);
                diagonal.previous.push(current.point);
                break;
            }
        }
    }
    for polygon in split.iter() {
        let current = polygon.borrow();
        let start = current.index;
        let point = current.point;
        for k in (0..start).rev() {
            let diagonal = polygons[k].borrow();
            if valid_polygon(polygons, point, diagonal.point) {
                if !diagonal.merge {
                    monotone.push(polygons[k].clone());
                    let mut current = polygon.borrow_mut();
                    let mut diagonal = polygons[k].borrow_mut();
                    current.merge = true;
                    current.next.push(diagonal.point);
                    current.previous.push(diagonal.point);
                    diagonal.next.push(current.point);
                    diagonal.previous.push(current.point);
                }
                break;
            }
        }
    }
}

fn clip(
    sec: &Sector,
    floor: bool,
    scale: f32,
    monotone: &Vec<Rc<RefCell<Polygon>>>,
    triangles: &mut Vec<Triangle>,
) {
}

fn clip_all(
    sec: &Sector,
    floor: bool,
    scale: f32,
    monotone: &Vec<Rc<RefCell<Polygon>>>,
    triangles: &mut Vec<Triangle>,
) {
    let mut vecs = Vec::new();
    for polygon in monotone.iter() {
        let start = polygon.borrow().index;
        let next = polygon.borrow().next[0];
        let mut current = start;
        loop {
            vecs.push(monotone[current].borrow().point);
            let mut angle = std::f32::MAX;
            for {
            }
            let mut previous = 0;
            next = current;
            current = previous;
            if (current == start) {
                break;
            }
        }
        vecs.clear();
    }
}

fn construct(sector: &Sector, floor: bool, scale: f32, triangles: &mut Vec<Triangle>) {
    if skip(sector, floor) {
        return;
    }
    let mut polygons = Vec::new();
    let mut monotone = Vec::new();
    populate(sector, floor, &mut polygons);
    classify(&polygons, &mut monotone);
    clip_all(sector, floor, scale, &monotone, triangles);
}

pub fn triangulate_sector(sec: &mut Sector, scale: f32) {
    let mut triangles: Vec<Triangle> = Vec::new();
    construct(sec, true, scale, &mut triangles);
    construct(sec, false, scale, &mut triangles);
    sec.update_triangles(triangles);
}
