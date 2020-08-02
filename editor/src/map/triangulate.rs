use crate::map::sector::Sector;
use crate::map::triangle::Triangle;
use crate::math::util::float_eq;
use crate::math::vector::Vector2;

use std::cell::RefCell;

struct Polygon {
    index: usize,
    merge: bool,
    perimeter: bool,
    previous: Vec<RefCell<Polygon>>,
    next: Vec<RefCell<Polygon>>,
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

fn poly_vec_equal(polygon: &Polygon, point: Vector2) -> bool {
    float_eq(polygon.point.x, point.x) && float_eq(polygon.point.y, point.y)
}

// fn poly_find<'a, 'b>(polygons: &Vec<Polygon<'b>>, point: Vector2) -> Option<&'a mut Polygon<'b>> {
//     for poly in polygons.iter_mut() {
//         if poly_vec_equal(poly, point) {
//             return Some(poly);
//         }
//     }
//     return Option::None;
// }

fn poly_compare(a: &Polygon, b: &Polygon) -> i32 {
    let i = a.point;
    let e = b.point;
    if i.y < e.y || (float_eq(i.y, e.y) && i.x > e.x) {
        return 1;
    }
    return -1;
}

fn poly_sorted_insert(polygons: &mut Vec<Polygon>, poly: Polygon) {
    for (i, existing) in polygons.iter().enumerate() {
        if poly_compare(&poly, existing) <= 0 {
            polygons.insert(i, poly);
            return;
        }
    }
    polygons.push(poly);
}

fn clean_population(polygons: &mut Vec<Polygon>) {}

fn populate_with_links(sec: &Sector, polygons: &mut Vec<Polygon>, clockwise: bool) {
    let len: usize = sec.vecs.len();
    for i in 0..len {
        for o in polygons.iter_mut() {
            if poly_vec_equal(o, sec.vecs[i]) {
                for p in polygons.iter() {
                    if poly_vec_equal(p, sec.vecs[len - 1]) {
                        o.previous.push(RefCell::new(p));
                    }
                }
                break;
            }
        }

        // let original = poly_find(polygons, sec.vecs[i]).unwrap();
        // let previous;
        // let next;
        // if clockwise {
        //     if i == 0 {
        //         previous = poly_find(polygons, sec.vecs[len - 1]).unwrap();
        //     } else {
        //         previous = poly_find(polygons, sec.vecs[i - 1]).unwrap();
        //     }
        //     if i == len - 1 {
        //         next = poly_find(polygons, sec.vecs[0]).unwrap();
        //     } else {
        //         next = poly_find(polygons, sec.vecs[i + 1]).unwrap();
        //     }
        // } else {
        //     if i == 0 {
        //         next = poly_find(polygons, sec.vecs[len - 1]).unwrap();
        //     } else {
        //         next = poly_find(polygons, sec.vecs[i - 1]).unwrap();
        //     }
        //     if i == len - 1 {
        //         previous = poly_find(polygons, sec.vecs[0]).unwrap();
        //     } else {
        //         previous = poly_find(polygons, sec.vecs[i + 1]).unwrap();
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

fn populate_with_vectors(sec: &Sector, polygons: &mut Vec<Polygon>) {
    for point in sec.vecs.iter().copied() {
        let mut exists = false;
        for poly in polygons.iter() {
            if float_eq(poly.point.x, point.x) && float_eq(poly.point.y, point.y) {
                exists = true;
                break;
            }
        }
        if !exists {
            let poly = Polygon::new(point);
            poly_sorted_insert(polygons, poly);
        }
    }
}

fn populate<'p>(sec: &Sector, floor: bool, mut polygons: &mut Vec<Polygon>) {
    for inner in sec.inside.iter() {
        if floor {
            if !inner.has_floor() {
                continue;
            }
        } else if !inner.has_ceiling() {
            continue;
        }
        populate_with_vectors(inner, &mut polygons);
    }
    for inner in sec.inside.iter() {
        if floor {
            if !inner.has_floor() {
                continue;
            }
        } else if !inner.has_ceiling() {
            continue;
        }
        populate_with_links(inner, &mut polygons, false);
    }
    clean_population(&mut polygons);
    populate_with_vectors(sec, &mut polygons);
    populate_with_links(sec, &mut polygons, true);
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

fn construct(sec: &Sector, floor: bool, scale: f32, triangles: &mut Vec<Triangle>) {
    if floor {
        if !sec.has_floor() {
            return;
        }
    } else if !sec.has_ceiling() {
        return;
    }
    let mut polygons = Vec::new();
    let mut monotone = Vec::new();
    populate(sec, floor, &mut polygons);
    classify(&polygons, &mut monotone);
    clip(sec, floor, scale, &monotone, triangles);
}

pub fn triangulate_sector(sec: &mut Sector, scale: f32) {
    let mut triangles: Vec<Triangle> = Vec::new();
    construct(sec, true, scale, &mut triangles);
    construct(sec, false, scale, &mut triangles);
    sec.update_triangles(triangles);
}
