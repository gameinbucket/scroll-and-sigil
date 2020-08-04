use crate::map::sector::Sector;
use crate::map::triangle::Triangle;
use crate::math::util::float_eq;
use crate::math::vector::Vector2;

use std::cell::RefCell;
use std::rc::Rc;
use std::rc::Weak;

struct Polygon {
    index: usize,
    merge: bool,
    perimeter: bool,
    previous: Vec<Rc<RefCell<Polygon>>>,
    next: Vec<Rc<RefCell<Polygon>>>,
    point: Vector2,
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

fn polygon_compare(a: &Polygon, b: &Polygon) -> i32 {
    let i = a.point;
    let e = b.point;
    if i.y < e.y || (float_eq(i.y, e.y) && i.x > e.x) {
        return 1;
    }
    return -1;
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

fn clean_population(polygons: &mut Vec<Rc<RefCell<Polygon>>>) {
    // let remaining = Vec::new();
    // for polygon in polygons.iter() {
    //     remaining.push(Polygon::new(polygon.point));
    // }
    // while remaining.len() > 0 {
    //     let start = remaining[0];
    //     let current = start;
    //        loop {
    // if current == start {
    //     break;
    //        }
    // }
}

fn angle(a: Vector2, b: Vector2) -> f64 {
    // let angle = atan2(a->y - b->y, a->x - b->x);
    // if (angle < 0) {
    //     angle += MATH_TAU;
    // }
    // return angle;
    0.0
}

fn populate_references(sec: &Sector, polygons: &mut Vec<Rc<RefCell<Polygon>>>, clockwise: bool) {
    let len: usize = sec.vecs.len();
    for i in 0..len {
        let original = polygon_find(polygons, sec.vecs[i]).unwrap();
        let p: usize;
        let n: usize;
        if clockwise {
            if i == 0 {
                p = len - 1;
            } else {
                p = i - 1;
            }
            if i == len - 1 {
                n = 0;
            } else {
                n = i + 1;
            }
        } else {
            if i == 0 {
                n = len - 1;
            } else {
                n = i - 1;
            }
            if i == len - 1 {
                p = 0;
            } else {
                p = i + 1;
            }
        }
        let next = polygon_find(polygons, sec.vecs[n]).unwrap();
        let previous = polygon_find(polygons, sec.vecs[p]).unwrap();
        if original.borrow().previous.is_empty() {
            original.borrow_mut().previous.push(previous);
        } else {
            let borrow = original.borrow();
            let point = borrow.point;
            let using = borrow.previous[0].borrow().point;
            // polygon_vertex *using_last = original->last->items[0];

            // double angle = calc_angle(using_last->point, original->point);

            // if (calc_angle(last->point, original->point) < angle) {
            //     array_insert(original->last, 0, last);
            // }

            let angle = angle(using, point);
        }
        if original.borrow().next.is_empty() {
            original.borrow_mut().next.push(next);
        } else {
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

fn populate<'p>(sec: &Sector, floor: bool, mut polygons: &mut Vec<Rc<RefCell<Polygon>>>) {
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
        populate_references(inner, &mut polygons, false);
    }
    clean_population(&mut polygons);
    populate_vectors(sec, &mut polygons);
    populate_references(sec, &mut polygons, true);
    for i in 0..polygons.len() {
        polygons[i].borrow_mut().index = i
    }
}

fn classify(polygons: &Vec<Rc<RefCell<Polygon>>>, monotone: &mut Vec<Rc<RefCell<Polygon>>>) {}

fn clip<'p>(
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
