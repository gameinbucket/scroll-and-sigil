use crate::math::vector::Vector2;

pub struct Wall {
    pub a: Vector2,
    pub b: Vector2,
    pub texture: i32,
    pub floor: f32,
    pub ceiling: f32,
    pub u: f32,
    pub v: f32,
    pub s: f32,
    pub t: f32,
}

impl Wall {
    pub fn new(a: Vector2, b: Vector2, texture: i32) -> Self {
        Wall {
            a,
            b,
            texture,
            floor: 0.0,
            ceiling: 0.0,
            u: 0.0,
            v: 0.0,
            s: 0.0,
            t: 0.0,
        }
    }
}
