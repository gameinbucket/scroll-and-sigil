use crate::math::vector::Vector2;

pub struct Triangle {
    pub height: f32,
    pub a: Vector2,
    pub b: Vector2,
    pub c: Vector2,
    pub texture: i32,
    pub uva: Vector2,
    pub uvb: Vector2,
    pub uvc: Vector2,
}

impl Triangle {
    pub fn new(a: Vector2, b: Vector2, c: Vector2, height: f32, texture: i32) -> Self {
        Triangle {
            height,
            a,
            b,
            c,
            texture,
            uva: Vector2::default(),
            uvb: Vector2::default(),
            uvc: Vector2::default(),
        }
    }
}
