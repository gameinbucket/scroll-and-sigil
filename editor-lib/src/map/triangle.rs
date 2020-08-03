use crate::math::vector::Vector2;

pub struct Triangle {
    pub height: f32,
    pub va: Vector2,
}

impl Triangle {
    pub fn new() -> Self {
        Triangle {
            height: 0.0,
            va: Vector2::default(),
        }
    }
}

impl Default for Triangle {
    fn default() -> Self {
        Triangle::new()
    }
}
