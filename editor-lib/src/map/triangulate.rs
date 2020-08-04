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

fn polygon_find(polygons: &Vec<Polygon>, point: Vector2) -> Option<&Polygon> {
    for poly in polygons.iter() {
        if polygon_vec_equal(poly, point) {
            return Some(poly);
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

fn polygon_sorted_insert(polygons: &mut Vec<Polygon>, point: Vector2) {
    let polygon = Polygon::new(point);
    for (i, existing) in polygons.iter().enumerate() {
        if polygon_compare(&polygon, existing) <= 0 {
            polygons.insert(i, Rc::new(RefCell::new(polygon)));
            return;
        }
    }
    polygons.push(polygon);
}

fn clean_population(polygons: &mut Vec<Polygon>) {
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

fn populate_references(sec: &Sector, polygons: &mut Vec<Polygon>, clockwise: bool) {
    let len: usize = sec.vecs.len();
    for i in 0..len {
        let original = polygon_find(polygons, sec.vecs[i]).unwrap();
        let previous = polygon_find(polygons, sec.vecs[len - 1]).unwrap();

        // original.previous.push(Rc::new(RefCell::new(previous)));

        // let original = polygon_find(polygons, sec.vecs[i]).unwrap();
        // let previous;
        // let next;
        // if clockwise {
        //     if i == 0 {
        //         previous = polygon_find(polygons, sec.vecs[len - 1]).unwrap();
        //     } else {
        //         previous = polygon_find(polygons, sec.vecs[i - 1]).unwrap();
        //     }
        //     if i == len - 1 {
        //         next = polygon_find(polygons, sec.vecs[0]).unwrap();
        //     } else {
        //         next = polygon_find(polygons, sec.vecs[i + 1]).unwrap();
        //     }
        // } else {
        //     if i == 0 {
        //         next = polygon_find(polygons, sec.vecs[len - 1]).unwrap();
        //     } else {
        //         next = polygon_find(polygons, sec.vecs[i - 1]).unwrap();
        //     }
        //     if i == len - 1 {
        //         previous = polygon_find(polygons, sec.vecs[0]).unwrap();
        //     } else {
        //         previous = polygon_find(polygons, sec.vecs[i + 1]).unwrap();
        //     }
        // }
        // if original.previous.is_empty() {
        //     original.previous.push(previous);
        // } else {
        // }
        // if original.next.is_empty() {
        //     original.next.push(previous);
        // } else {
        // }
    }
}

fn populate_vectors(sec: &Sector, polygons: &mut Vec<Polygon>) {
    for point in sec.vecs.iter().copied() {
        let mut exists = false;
        for polygon in polygons.iter() {
            if polygon_vec_equal(polygon, point) {
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

fn populate<'p>(sec: &Sector, floor: bool, mut polygons: &mut Vec<Polygon>) {
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
        polygons[i].index = i
    }
}

fn classify(polygons: &Vec<Polygon>, monotone: &mut Vec<Polygon>) {}

fn clip<'p>(
    sec: &Sector,
    floor: bool,
    scale: f32,
    monotone: &Vec<Polygon>,
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
