use crate::math::vector::Vector3;

pub struct Triangle {
    pub height: f32,
    pub va: Vector3,
}

impl Triangle {
    pub fn new() -> Self {
        Triangle {
            height: 0.0,
            va: Vector3::default(),
        }
    }
}

impl Default for Triangle {
    fn default() -> Self {
        Triangle::new()
    }
}
