use crate::map::sector::Sector;
use crate::map::triangle::Triangle;
use crate::math::util::float_eq;
use crate::math::util::float_zero;
use crate::math::vector::Vector2;

use std::cell::RefCell;
use std::collections::HashSet;
use std::rc::Rc;

struct Polygon {
    index: usize,
    merge: bool,
    perimeter: bool,
    point: Vector2,
    previous: Vec<Rc<RefCell<Polygon>>>,
    next: Vec<Rc<RefCell<Polygon>>>,
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

fn polygon_remove_point(polygons: &mut Vec<Rc<RefCell<Polygon>>>, point: Vector2) {
    for i in 0..polygons.len() {
        if polygons[i].borrow().point.eq(point) {
            polygons.remove(i);
            break;
        }
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

fn polygon_compare(a: &Polygon, b: &Polygon) -> i32 {
    let i = a.point;
    let e = b.point;
    if i.y < e.y || (float_eq(i.y, e.y) && i.x > e.x) {
        return 1;
    }
    return -1;
}

fn vector_angle(a: Vector2, b: Vector2) -> f32 {
    let mut angle = (a.y - b.y).atan2(a.x - b.x);
    if angle < 0.0 {
        angle += 2.0 * std::f32::consts::PI;
    }
    return angle;
}

fn vector_interior_angle(first: Vector2, second: Vector2, third: Vector2) -> f32 {
    let angle_one = (first.y - second.y).atan2(first.x - second.x);
    let angle_two = (second.y - third.y).atan2(second.x - third.x);
    let mut interior = angle_two - angle_one;
    if interior < 0.0 {
        interior += 2.0 * std::f32::consts::PI;
    }
    return interior;
}

fn triangle_contains(tri: &[Vector2; 3], x: f32, y: f32) -> bool {
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
        let d = polygon.borrow().previous[0].borrow().point;
        if !a.eq(c) && !a.eq(d) && !b.eq(c) && !b.eq(d) && vector_line_intersect(a, b, c, d) {
            return false;
        }
    }
    true
}

fn triangle_valid(vectors: &Vec<Vector2>, a: Vector2, b: Vector2, c: Vector2) -> bool {
    if vector_interior_angle(a, b, c) > std::f32::consts::PI {
        return false;
    }
    let tri = [a, b, c];
    for vec in vectors.iter().copied() {
        if vec.eq(a) || vec.eq(b) || vec.eq(c) {
            continue;
        }
        if triangle_contains(&tri, vec.x, vec.y) {
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
            remaining.retain(|&x| x != current);
            while polygon.next.len() != 1 {
                let next = polygon.next[1].borrow().index;
                pending.insert(next);
                polygon.next.remove(1);
            }
            while polygon.previous.len() != 1 {
                polygon.previous.remove(1);
            }
            current = polygon.next[0].borrow().index;
            if current == start {
                break;
            }
        }
        while pending.len() > 0 {
            for polygon_index in pending.iter().copied() {
                dead.insert(polygon_index);
                let polygon = polygons[polygon_index].borrow();
                for ref_next in polygon.next.iter() {
                    let next = ref_next.borrow();
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
        let mut p = if i == 0 { len - 1 } else { i - 1 };
        let mut n = if i == len - 1 { 0 } else { i + 1 };
        if !clockwise {
            let t = p;
            p = n;
            n = t;
        }
        let next = polygon_find(polygons, sec.vecs[n]).unwrap();
        let previous = polygon_find(polygons, sec.vecs[p]).unwrap();
        let ref_original = polygon_find(polygons, sec.vecs[i]).unwrap();
        let mut original = ref_original.borrow_mut();
        if original.previous.is_empty() {
            original.previous.push(previous.clone());
        } else {
            let point = original.point;
            let existing = original.previous[0].borrow().point;
            if vector_angle(previous.borrow().point, point) < vector_angle(existing, point) {
                original.previous.insert(0, previous);
            }
        }
        if original.next.is_empty() {
            original.next.push(next);
        } else {
            let point = original.point;
            let existing = original.next[0].borrow().point;
            if vector_angle(next.borrow().point, point) < vector_angle(existing, point) {
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
        return !sector.has_floor();
    }
    !sector.has_ceiling()
}

fn populate(
    sectors: &mut Vec<Sector>,
    sector: usize,
    floor: bool,
    mut polygons: &mut Vec<Rc<RefCell<Polygon>>>,
) {
    let sector = &sectors[sector];
    for inner in sector.inside.iter().copied() {
        let inner = &sectors[inner];
        if skip(inner, floor) {
            continue;
        }
        populate_vectors(inner, &mut polygons);
    }
    for inner in sector.inside.iter().copied() {
        let inner = &sectors[inner];
        if skip(inner, floor) {
            continue;
        }
        populate_references(inner, &polygons, false);
    }
    cull_vectors(&mut polygons);
    populate_vectors(sector, &mut polygons);
    populate_references(sector, &polygons, true);
    update_polygon_indices(&polygons);
}

fn classify(polygons: &Vec<Rc<RefCell<Polygon>>>, monotone: &mut Vec<Rc<RefCell<Polygon>>>) {
    let mut merge = Vec::new();
    let mut split = Vec::new();
    for polygon in polygons.iter() {
        let current = polygon.borrow();
        let previous = current.previous[0].borrow().point;
        let next = current.next[0].borrow().point;
        let reflex = vector_interior_angle(previous, current.point, next) > std::f32::consts::PI;
        let both_above = previous.y < current.point.y && next.y <= current.point.y;
        let both_below = previous.y >= current.point.y && next.y >= current.point.y;
        let collinear = next.y == current.point.y;
        if (both_above && reflex) {
            monotone.push(polygon.clone());
        } else if (both_above && !reflex) {
            if (!collinear) {
                split.push(polygon.clone());
            }
        } else if (both_below && !reflex) {
            if (!collinear) {
                merge.push(polygon.clone());
            }
        }
    }
    for polygon in merge.iter() {
        let start = polygon.borrow().index + 1;
        let point = polygon.borrow().point;
        for k in start..polygons.len() {
            let diagonal = &polygons[k];
            if valid_polygon(polygons, point, diagonal.borrow().point) {
                {
                    let mut current = polygon.borrow_mut();
                    current.merge = true;
                    current.next.push(diagonal.clone());
                    current.previous.push(diagonal.clone());
                }
                {
                    let mut diagonal = diagonal.borrow_mut();
                    diagonal.next.push(polygon.clone());
                    diagonal.previous.push(polygon.clone());
                }
                break;
            }
        }
    }
    for polygon in split.iter() {
        let current = polygon.borrow();
        let start = current.index;
        let point = current.point;
        for k in (0..start).rev() {
            let diagonal = &polygons[k];
            if valid_polygon(polygons, point, diagonal.borrow().point) {
                if !diagonal.borrow().merge {
                    monotone.push(diagonal.clone());
                    {
                        let mut current = polygon.borrow_mut();
                        current.merge = true;
                        current.next.push(diagonal.clone());
                        current.previous.push(diagonal.clone());
                    }
                    {
                        let mut diagonal = diagonal.borrow_mut();
                        diagonal.next.push(polygon.clone());
                        diagonal.previous.push(polygon.clone());
                    }
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
    triangles: &mut Vec<Triangle>,
    vecs: &mut Vec<Vector2>,
) {
    let mut i = 0;
    let mut size = vecs.len();
    while size > 3 {
        let plus = if i == size - 1 { 0 } else { i + 1 };
        let minus = if i == 0 { size - 1 } else { i - 1 };
        let previous = vecs[minus];
        let current = vecs[i];
        let next = vecs[plus];
        if triangle_valid(vecs, previous, current, next) {
            let tri;
            if floor {
                tri = Triangle::new(previous, current, next, sec.floor, sec.floor_texture);
            } else {
                tri = Triangle::new(next, current, previous, sec.ceiling, sec.ceiling_texture);
            }
            triangles.push(tri);
            vecs.remove(i);
            size -= 1;
        } else {
            i += 1;
        }
        if i == size {
            i = 0;
        }
    }
    let tri;
    if floor {
        tri = Triangle::new(vecs[0], vecs[1], vecs[2], sec.floor, sec.floor_texture);
    } else {
        tri = Triangle::new(vecs[2], vecs[1], vecs[0], sec.ceiling, sec.ceiling_texture);
    }
    triangles.push(tri);
}

fn clip_all(
    sec: &Sector,
    floor: bool,
    scale: f32,
    monotone: &Vec<Rc<RefCell<Polygon>>>,
    triangles: &mut Vec<Triangle>,
) {
    let mut vecs = Vec::new();
    for start in monotone.iter() {
        let mut next = start.borrow().next[0].clone();
        let mut current = start.clone();
        loop {
            let a = next.borrow().point;
            let b = current.borrow().point;
            vecs.push(b);
            let mut angle = std::f32::MAX;
            let mut previous = Option::None;
            for ref_previous in current.borrow().previous.iter() {
                let c = ref_previous.borrow().point;
                let angle_1 = (a.x - b.x).atan2(a.y - b.y);
                let angle_2 = (b.x - c.x).atan2(b.y - c.y);
                let mut interior = angle_2 - angle_1;
                if (interior < 0.0) {
                    interior += 2.0 * std::f32::consts::PI;
                }
                interior += std::f32::consts::PI;
                if (interior > 2.0 * std::f32::consts::PI) {
                    interior -= 2.0 * std::f32::consts::PI;
                }
                if (interior < angle) {
                    previous = Some(ref_previous.clone());
                    angle = interior;
                }
            }
            let mut previous = previous.unwrap();
            {
                let mut mutate_current = current.borrow_mut();
                polygon_remove_point(&mut mutate_current.next, a);
                polygon_remove_point(&mut mutate_current.previous, previous.borrow().point);
            }
            if Rc::ptr_eq(&previous, start) {
                break;
            }
            next = current;
            current = previous;
        }
        clip(sec, floor, scale, triangles, &mut vecs);
        vecs.clear();
    }
}

fn construct(
    sectors: &mut Vec<Sector>,
    sector: usize,
    floor: bool,
    scale: f32,
    triangles: &mut Vec<Triangle>,
) {
    if skip(&sectors[sector], floor) {
        return;
    }
    let mut polygons = Vec::new();
    let mut monotone = Vec::new();
    println!("populate");
    populate(sectors, sector, floor, &mut polygons);
    println!("classify {}", polygons.len());
    classify(&polygons, &mut monotone);
    println!("clip {}", monotone.len());
    clip_all(&sectors[sector], floor, scale, &monotone, triangles);
    println!("triangles {}", triangles.len());
    for polygon in polygons.iter() {
        let mut polygon = polygon.borrow_mut();
        polygon.next.clear();
        polygon.previous.clear();
    }
    monotone.clear();
    polygons.clear();
    println!("---------------------------");
}

pub fn triangulate_sector(sectors: &mut Vec<Sector>, sector: usize, scale: f32) {
    let mut triangles: Vec<Triangle> = Vec::new();
    construct(sectors, sector, true, scale, &mut triangles);
    construct(sectors, sector, false, scale, &mut triangles);
    sectors[sector].update_triangles(triangles);
}
