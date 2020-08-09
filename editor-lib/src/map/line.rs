use crate::map::sector::Sector;
use crate::map::wall::Wall;
use crate::math::util::float_zero;
use crate::math::vector::Vector2;

use std::rc::Weak;

pub struct Intersect {
    pub x: f32,
    pub y: f32,
    pub ok: bool,
}

pub struct Line {
    pub bottom: Option<Wall>,
    pub middle: Option<Wall>,
    pub top: Option<Wall>,
    pub a: Vector2,
    pub b: Vector2,
    pub normal: Vector2,
    pub plus: Option<Weak<Sector>>,
    pub minus: Option<Weak<Sector>>,
}

impl Line {
    pub fn new(low: i32, mid: i32, up: i32, a: Vector2, b: Vector2) -> Self {
        let mut bottom = Option::None;
        let mut middle = Option::None;
        let mut top = Option::None;
        if low >= 0 {
            bottom = Some(Wall::new(a, b, low))
        }
        if mid >= 0 {
            middle = Some(Wall::new(a, b, mid))
        }
        if up >= 0 {
            top = Some(Wall::new(a, b, up))
        }
        let x = a.y - b.y;
        let y = -(a.x - b.x);
        let m = (x * x + y * y).sqrt();
        Line {
            bottom,
            middle,
            top,
            a,
            b,
            normal: Vector2::new(x / m, y / m),
            plus: Option::None,
            minus: Option::None,
        }
    }
    pub fn update_sectors(&self) {
        // TODO
        // self.plus = Some(plus);
        // self.minus = Some(minus);
    }
    pub fn intersect(&self, with: &Line) -> Intersect {
        let a1: f32 = self.b.y - self.a.y;
        let b1: f32 = self.a.x - self.b.x;
        let c1: f32 = (self.b.x * self.a.y) - (self.a.x * self.b.y);

        let r3: f32 = (a1 * with.a.x) + (b1 * with.a.y) + c1;
        let r4: f32 = (a1 * with.b.x) + (b1 * with.b.y) + c1;
        if !float_zero(r3) && !float_zero(r4) && (r3 * r4 >= 0.0) {
            return Intersect {
                x: 0.0,
                y: 0.0,
                ok: false,
            };
        }

        // TODO

        let x: f32 = 0.0;
        let y: f32 = 0.0;

        Intersect { x, y, ok: true }
    }
}
