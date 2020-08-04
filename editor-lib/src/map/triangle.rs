use crate::math::vector::Vector2;

pub struct Triangle {
    pub height: f32,
    pub a: Vector2,
    pub b: Vector2,
    pub c: Vector2,
    pub texture: u32,
    pub uva: Vector2,
    pub uvb: Vector2,
    pub uvc: Vector2,
}

impl Triangle {
    pub fn new(a: Vector2, b: Vector2, c: Vector2) -> Self {
        Triangle {
            height: 0.0,
            a,
            b,
            c,
            texture: 0,
            uva: Vector2::default(),
            uvb: Vector2::default(),
            uvc: Vector2::default(),
        }
    }
}
